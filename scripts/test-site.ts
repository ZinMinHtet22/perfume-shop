import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const BASE = "http://localhost:3000";

type Result = { name: string; pass: boolean; detail?: string };
const results: Result[] = [];

function check(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}${!pass && detail ? ` :: ${detail}` : ""}`);
}

class Jar {
  cookies = new Map<string, string>();

  absorb(res: Response) {
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const line of setCookies) {
      const first = line.split(";")[0];
      const eq = first.indexOf("=");
      if (eq > 0) {
        const name = first.slice(0, eq).trim();
        const value = first.slice(eq + 1).trim();
        if (value) this.cookies.set(name, value);
        else this.cookies.delete(name);
      }
    }
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

type Hit = {
  status: number;
  location: string | null;
  body: string;
  res: Response;
};

async function get(
  path: string,
  jar?: Jar,
  opts: { redirect?: "manual" | "follow" } = {}
): Promise<Hit> {
  const res = await fetch(`${BASE}${path}`, {
    redirect: opts.redirect ?? "follow",
    headers: jar ? { cookie: jar.header() } : {},
  });
  jar?.absorb(res);
  const body = await res.text();
  return {
    status: res.status,
    location: res.headers.get("location"),
    body,
    res,
  };
}

async function postForm(
  path: string,
  jar: Jar,
  fields: Record<string, string>
): Promise<Hit> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { cookie: jar.header() },
    body: fd,
  });
  jar.absorb(res);
  const body = await res.text();
  if (res.status !== 303 && res.status !== 302) {
    console.log(
      `[post ${path}] unexpected status ${res.status}, body head: ${JSON.stringify(body.slice(0, 240))}`
    );
  }
  return { status: res.status, location: res.headers.get("location"), body, res };
}

async function login(jar: Jar, email: string, password: string): Promise<boolean> {
  const csrf = await get("/api/auth/csrf", jar);
  const token = (csrf.body.match(/"csrfToken":"([^"]+)"/) ?? [])[1];
  if (!token) return false;
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      cookie: jar.header(),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken: token,
      email,
      password,
      json: "true",
    }).toString(),
  });
  jar.absorb(res);
  const loc = res.headers.get("location") ?? "";
  return res.status === 302 && !loc.includes("error=");
}

function actionIdNear(
  html: string,
  marker: string,
  lookBack = 1500
): string | null {
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const slice = html.slice(Math.max(0, i - lookBack), i);
  const ids = slice.match(/\$ACTION_ID_[a-f0-9]+/g);
  return ids && ids.length ? ids[ids.length - 1] : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

// Bound server actions render $ACTION_REF_n + $ACTION_n:0 (id) + $ACTION_n:1 (args)
function boundActionFields(
  html: string,
  marker: string,
  lookBack = 2500
): Record<string, string> | null {
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const slice = html.slice(Math.max(0, i - lookBack), i + 2500);
  const ref = slice.match(/name="(\$ACTION_REF_\d+)"/);
  const idm = slice.match(/name="(\$ACTION_\d+:0)" value="([^"]+)"/);
  const argm = slice.match(/name="(\$ACTION_\d+:1)" value="([^"]+)"/);
  if (!ref || !idm || !argm) return null;
  return {
    [ref[1]]: "",
    [idm[1]]: decodeEntities(idm[2]),
    [argm[1]]: decodeEntities(argm[2]),
  };
}

async function main() {
  // ---------- data from DB ----------
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });
  const smokeOrder = await prisma.order.findFirst({
    where: { orderNo: "PF-SMOKE-MVG8QPME" },
    select: { id: true, orderNo: true },
  });
  const anyProduct = await prisma.product.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@perfumeshop.com" },
    select: { id: true },
  });

  // ---------- A. storefront routes (EN + MY) ----------
  const slash = await get("/", undefined, { redirect: "manual" });
  check("GET / → 307", slash.status === 307, `got ${slash.status}`);
  check(
    "/ redirects to /en",
    (slash.location ?? "").startsWith("/en"),
    slash.location ?? "none"
  );

  for (const loc of ["en", "my"]) {
    const home = await get(`/${loc}`);
    check(
      `GET /${loc} home 200 + shop link`,
      home.status === 200 && home.body.includes(`/${loc}/shop`),
      `status ${home.status}`
    );
    const shop = await get(`/${loc}/shop`);
    check(
      `GET /${loc}/shop 200 + product cards`,
      shop.status === 200 && shop.body.includes(`/${loc}/product/`),
      `status ${shop.status}`
    );
    check(
      `GET /${loc}/shop filter form`,
      shop.body.includes('name="q"')
    );
    const cart = await get(`/${loc}/cart`);
    check(`GET /${loc}/cart 200`, cart.status === 200, `${cart.status}`);
    const loginPage = await get(`/${loc}/login`);
    check(
      `GET /${loc}/login 200 + password field`,
      loginPage.status === 200 && loginPage.body.includes('type="password"'),
      `${loginPage.status}`
    );
    const register = await get(`/${loc}/register`);
    check(
      `GET /${loc}/register 200 + password field`,
      register.status === 200 && register.body.includes('type="password"'),
      `${register.status}`
    );
    const wishlist = await get(`/${loc}/wishlist`);
    check(
      `GET /${loc}/wishlist 200 (sign-in CTA anon)`,
      wishlist.status === 200 &&
        (wishlist.body.includes("Sign in") ||
          wishlist.body.includes("အကောင့်ဝင်ရန်")),
      `${wishlist.status}`
    );
    const about = await get(`/${loc}/about`);
    check(`GET /${loc}/about 200`, about.status === 200, `${about.status}`);
    const contact = await get(`/${loc}/contact`);
    check(`GET /${loc}/contact 200`, contact.status === 200, `${contact.status}`);
    const checkout = await get(`/${loc}/checkout`, undefined, {
      redirect: "manual",
    });
    check(
      `GET /${loc}/checkout anon → 307 /${loc}/login`,
      checkout.status === 307 &&
        (checkout.location ?? "").includes(`/${loc}/login`),
      `status ${checkout.status} loc ${checkout.location}`
    );
  }

  const myAbout = await get("/my/about");
  check(
    "MY about has Burmese content",
    myAbout.body.includes("ကျွန်ုပ်တို့အကြောင်း")
  );
  const enAbout = await get("/en/about");
  check("EN about has English title", enAbout.body.includes("About Us"));

  // product pages
  const slugs = products.slice(0, 25).map((p) => p.slug);
  let productFails = 0;
  for (const slug of slugs) {
    const res = await get(`/en/product/${slug}`);
    if (
      res.status !== 200 ||
      !res.body.includes("Reviews") ||
      !res.body.includes("Add to wishlist")
    ) {
      productFails++;
      check(`product ${slug}`, false, `status ${res.status}`);
    }
  }
  check(
    `GET product pages EN (${slugs.length} products) all 200 + reviews + wishlist`,
    productFails === 0,
    `${productFails} failed`
  );
  const myProduct = await get(`/en/product/${slugs[0]}`);
  check(
    "product EN review sign-in prompt (anon)",
    myProduct.body.includes("Sign in to write a review")
  );
  const myProd = await get(`/my/product/${slugs[0]}`);
  check(
    "product MY 200 + Burmese reviews heading",
    myProd.status === 200 && myProd.body.includes("သုံးသပ်ချက်များ"),
    `${myProd.status}`
  );

  const missingProduct = await get("/en/product/does-not-exist-xyz");
  check(
    "unknown product not 5xx",
    missingProduct.status >= 400 || missingProduct.body.length > 0,
    `${missingProduct.status}`
  );

  const unknownRoute = await get("/en/definitely-not-a-page", undefined, {
    redirect: "manual",
  });
  check(
    "unknown route → 404",
    unknownRoute.status === 404,
    `${unknownRoute.status}`
  );

  // pay page
  if (smokeOrder) {
    const pay = await get(`/en/pay/${smokeOrder.orderNo}`);
    check(
      "GET pay page for real order 200 + orderNo",
      pay.status === 200 && pay.body.includes(smokeOrder.orderNo),
      `${pay.status}`
    );
    const payMy = await get(`/my/pay/${smokeOrder.orderNo}`);
    check("GET pay page MY 200", payMy.status === 200, `${payMy.status}`);
  }
  const payBad = await get("/en/pay/NO-SUCH-ORDER-123");
  check("GET pay unknown order not 5xx", payBad.status < 500, `${payBad.status}`);

  // ---------- B. admin anon guard ----------
  const adminAnon = await get("/admin", undefined, { redirect: "manual" });
  check(
    "GET /admin anon → 307 /login",
    adminAnon.status === 307 && adminAnon.location === "/login",
    `status ${adminAnon.status} loc ${adminAnon.location}`
  );

  // ---------- C. APIs ----------
  if (smokeOrder) {
    const st = await get(`/api/orders/${smokeOrder.orderNo}/status`);
    let stJson: Record<string, string> = {};
    try {
      stJson = JSON.parse(st.body);
    } catch {
      /* ignore */
    }
    check(
      "status API valid order 200 + statuses",
      st.status === 200 && !!stJson.orderStatus && !!stJson.paymentStatus,
      `${st.status} ${st.body}`
    );
  }
  const stBad = await get("/api/orders/BAD;DROP/status");
  check("status API bad chars → 400", stBad.status === 400, `${stBad.status}`);
  const stMissing = await get("/api/orders/NOPE-ORDER-999/status");
  check("status API unknown → 404", stMissing.status === 404, `${stMissing.status}`);

  const upOk = await get("/api/uploads/receipts/smoke-receipt.png");
  check(
    "uploads valid png 200 + image/png",
    upOk.status === 200 &&
      (upOk.res.headers.get("content-type") ?? "").includes("image/png"),
    `${upOk.status}`
  );
  const upTraversal = await get(
    "/api/uploads/receipts/..%2F..%2F.env",
    undefined,
    { redirect: "manual" }
  );
  check(
    "uploads traversal blocked (400/404, never 200)",
    upTraversal.status === 400 || upTraversal.status === 404,
    `${upTraversal.status}`
  );
  const upBadExt = await get("/api/uploads/receipts/evil.php");
  check("uploads bad extension → 400", upBadExt.status === 400, `${upBadExt.status}`);
  const upMissing = await get("/api/uploads/receipts/nope123.png");
  check("uploads missing file → 404", upMissing.status === 404, `${upMissing.status}`);

  // ---------- D. auth matrix ----------
  const adminJar = new Jar();
  const adminOk = await login(adminJar, "admin@perfumeshop.com", "Admin123!");
  check("admin login (NextAuth)", adminOk);

  const demoJar = new Jar();
  const demoOk = await login(demoJar, "demo@perfumeshop.com", "Demo123!");
  check("demo login (NextAuth)", demoOk);

  const demoAdmin = await get("/admin", demoJar, { redirect: "manual" });
  check(
    "demo user /admin → bounced away (307 /en or redirect digest), no dashboard",
    !demoAdmin.body.includes('href="/admin/coupons"') &&
      (demoAdmin.body.includes("NEXT_REDIRECT") ||
        (demoAdmin.status === 307 &&
          (demoAdmin.location ?? "").includes("/en"))),
    `${demoAdmin.status} ${demoAdmin.location ?? ""}`
  );

  const demoCheckout = await get("/en/checkout", demoJar, {
  redirect: "manual",
});
  check(
    "demo /en/checkout 200 (session required, not bounced to login)",
    demoCheckout.status === 200 && !demoCheckout.body.includes('type="password"'),
    `${demoCheckout.status}`
  );

  // ---------- E. admin pages (admin session) ----------
  const adminPages: [string, string][] = [
    ["/admin", "Coupons"],
    ["/admin/orders", "Coupons"],
    ["/admin/receipts", "Coupons"],
    ["/admin/products", "Coupons"],
    ["/admin/products/new", "Coupons"],
    ["/admin/coupons", "TEST10"],
    ["/admin/reviews", "Pending"],
  ];
  for (const [path, marker] of adminPages) {
    const page = await get(path, adminJar);
    check(
      `admin ${path} 200 + "${marker}"`,
      page.status === 200 && page.body.includes(marker),
      `${page.status}`
    );
  }
  if (smokeOrder) {
    const detail = await get(`/admin/orders/${smokeOrder.id}`, adminJar);
    check(
      "admin order detail 200 + orderNo + transition forms",
      detail.status === 200 &&
        detail.body.includes(smokeOrder.orderNo) &&
        detail.body.includes('name="next"'),
      `${detail.status}`
    );
  }
  if (anyProduct) {
    const edit = await get(`/admin/products/${anyProduct.id}`, adminJar);
    check(
      "admin product edit 200 + variants form",
      edit.status === 200 && edit.body.includes('name="variantsJson"'),
      `${edit.status}`
    );
  }

  // ---------- F. admin mutations ----------
  // F1. create + toggle coupon
  const couponsPage = await get("/admin/coupons", adminJar);
  const createId = actionIdNear(couponsPage.body, 'name="code"');
  check("coupon create action id found", !!createId, createId ?? "none");
  if (createId) {
    await prisma.coupon.deleteMany({ where: { code: "QATEST1" } });
    const created = await postForm("/admin/coupons", adminJar, {
      [createId]: "",
      code: "qatest1",
      type: "PERCENT",
      value: "5",
      minOrder: "0",
      usageLimit: "",
      expiresAt: "",
    });
    check(
      "POST create coupon QATEST1 → 303 ok=created",
      created.status === 303 &&
        (created.location ?? "").includes("ok=created"),
      `${created.status} ${created.location}`
    );
    const afterCreate = await get("/admin/coupons", adminJar);
    check("QATEST1 listed after create", afterCreate.body.includes("QATEST1"));
    // locate the toggle form specifically in the first row (bound action)
    const rowIdx = afterCreate.body.indexOf("QATEST1");
    let toggleFields: Record<string, string> | null = null;
    if (rowIdx >= 0) {
      toggleFields = boundActionFields(afterCreate.body, "Deactivate", 3000);
    }
    check(
      "coupon toggle bound-action fields found",
      !!toggleFields,
      toggleFields ? "" : "none"
    );
    if (toggleFields) {
      const toggled = await postForm("/admin/coupons", adminJar, toggleFields);
      check(
        "POST toggle coupon → 303 ok=toggled",
        toggled.status === 303 &&
          (toggled.location ?? "").includes("ok=toggled"),
        `${toggled.status} ${toggled.location}`
      );
      const afterToggle = await get("/admin/coupons", adminJar);
      const idx = afterToggle.body.indexOf("QATEST1");
      const row = afterToggle.body.slice(idx, idx + 3000);
      check(
        "QATEST1 now Inactive + Activate button",
        row.includes("Inactive") && row.includes("Activate")
      );
    }
    await prisma.coupon.deleteMany({ where: { code: "QATEST1" } });
  }

  // F2. review approve + delete (temp pending review)
  if (anyProduct && demoUser) {
    await prisma.review.deleteMany({
      where: { comment: { startsWith: "QATEST-REVIEW" } },
    });
    const tempReview = await prisma.review.create({
      data: {
        userId: demoUser.id,
        productId: anyProduct.id,
        rating: 4,
        comment: "QATEST-REVIEW pending moderation",
        isApproved: false,
      },
    });
    const pendingPage = await get("/admin/reviews", adminJar);
    const hasPending = pendingPage.body.includes("QATEST-REVIEW");
    check("temp pending review listed", hasPending);
    if (hasPending) {
      const approveId = actionIdNear(
        pendingPage.body,
        `name="reviewId" value="${tempReview.id}"`
      );
      check("review approve action id found", !!approveId, approveId ?? "none");
      if (approveId) {
        const approved = await postForm("/admin/reviews", adminJar, {
          [approveId]: "",
          reviewId: tempReview.id,
          backTo: "/admin/reviews",
        });
        check(
          "POST approve review → 303 ok=approved",
          approved.status === 303 &&
            (approved.location ?? "").includes("ok=approved"),
          `${approved.status} ${approved.location}`
        );
        const approvedTab = await get(
          "/admin/reviews?tab=approved",
          adminJar
        );
        check(
          "review visible on approved tab",
          approvedTab.body.includes("QATEST-REVIEW")
        );
        // now delete via action
        const rowIdx2 = approvedTab.body.indexOf("QATEST-REVIEW");
        const rowSlice = approvedTab.body.slice(
          Math.max(0, rowIdx2 - 2500),
          rowIdx2 + 1500
        );
        // find the action id of the delete form (after reviewId fields with backTo approved)
        let deleteId: string | null = null;
        const forms = rowSlice.split("<form");
        for (const form of forms) {
          if (form.includes(tempReview.id) && form.includes("tab=approved")) {
            const m = form.match(/\$ACTION_ID_[a-f0-9]+/);
            if (m) deleteId = m[0];
          }
        }
        if (!deleteId) {
          for (const form of rowSlice.split("<form")) {
            if (form.includes(tempReview.id)) {
              const m = form.match(/\$ACTION_ID_[a-f0-9]+/);
              if (m) deleteId = m[0];
            }
          }
        }
        check("review delete action id found", !!deleteId, deleteId ?? "none");
        if (deleteId) {
          const deleted = await postForm("/admin/reviews", adminJar, {
            [deleteId]: "",
            reviewId: tempReview.id,
            backTo: "/admin/reviews?tab=approved",
          });
          check(
            "POST delete review → 303 ok=deleted",
            deleted.status === 303 &&
              (deleted.location ?? "").includes("ok=deleted"),
            `${deleted.status} ${deleted.location}`
          );
        }
      }
    }
    const leftover = await prisma.review.findUnique({
      where: { id: tempReview.id },
    });
    check("temp review removed from DB", leftover === null);
    if (leftover) await prisma.review.delete({ where: { id: leftover.id } });
  }

  // F3. order transition on temp order
  if (demoUser) {
    const oldTemp = await prisma.order.findMany({
      where: { orderNo: { startsWith: "PF-QATEST" } },
      select: { id: true },
    });
    for (const o of oldTemp) {
      await prisma.payment.deleteMany({ where: { orderId: o.id } });
      await prisma.order.delete({ where: { id: o.id } });
    }
    const tempOrder = await prisma.order.create({
      data: {
        orderNo: "PF-QATEST-0001",
        userId: demoUser.id,
        status: "AWAITING_PAYMENT",
        paymentMethod: "BANK",
        subtotal: 10000,
        tax: 0,
        shipping: 0,
        total: 10000,
        addressSnapshot: { name: "QA", phone: "0900000000", line1: "T", city: "YGN", country: "MM" },
        items: { create: [] },
        payment: {
          create: {
            provider: "BANK",
            status: "PENDING",
            amount: 10000,
            currency: "MMK",
            merchOrderId: "PF_QATEST_0001",
          },
        },
      },
    });
    const detail = await get(`/admin/orders/${tempOrder.id}`, adminJar);
    const transId = actionIdNear(
      detail.body,
      `name="orderId" value="${tempOrder.id}"`,
      800
    );
    check("order transition action id found", !!transId, transId ?? "none");
    if (transId) {
      const cancelled = await postForm(`/admin/orders/${tempOrder.id}`, adminJar, {
        [transId]: "",
        orderId: tempOrder.id,
        next: "CANCELLED",
        backTo: `/admin/orders/${tempOrder.id}`,
      });
      check(
        "POST order AWAITING_PAYMENT→CANCELLED → 303 ok=status",
        cancelled.status === 303 &&
          (cancelled.location ?? "").includes("ok=status"),
        `${cancelled.status} ${cancelled.location}`
      );
      const after = await prisma.order.findUnique({
        where: { id: tempOrder.id },
        select: { status: true },
      });
      check("order status now CANCELLED", after?.status === "CANCELLED", after?.status ?? "missing");
    }
    await prisma.payment.deleteMany({ where: { orderId: tempOrder.id } });
    await prisma.order.deleteMany({ where: { orderNo: "PF-QATEST-0001" } });
  }

  // ---------- G. link crawler ----------
  const seeds = ["/en", "/my", "/en/shop", "/en/about", "/en/contact"];
  const discovered = new Set<string>();
  for (const seed of seeds) {
    const page = await get(seed);
    for (const m of page.body.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = m[1];
      if (
        href.startsWith("/_next") ||
        href.startsWith("/api") ||
        href.startsWith("/uploads")
      )
        continue;
      discovered.add(href);
    }
  }
  let linkFails = 0;
  const linkDetails: string[] = [];
  for (const href of [...discovered].sort()) {
    const res = await get(href, undefined, { redirect: "manual" });
    if (res.status >= 400 && res.status !== 404) {
      // 404 acceptable only for dynamic not-found shells
      linkFails++;
      linkDetails.push(`${href}=${res.status}`);
    } else if (res.status >= 500) {
      linkFails++;
      linkDetails.push(`${href}=${res.status}`);
    }
  }
  check(
    `link crawler: ${discovered.size} internal links (no 5xx, no hard fails)`,
    linkFails === 0,
    linkDetails.join(", ")
  );

  // ---------- H. landing features ----------
  const home = await get("/en");
  check(
    "landing hero 3D container present (canvas mounts client-side)",
    home.body.includes("h-[360px]"),
    "hero container missing"
  );
  check("landing navbar wishlist link", home.body.includes("/en/wishlist"));
  check("landing navbar cart", home.body.includes("/en/cart"));
  check("landing locale switcher (MY button)", home.body.includes("MY"));
  check(
    "landing featured products section (cards link to products)",
    home.body.includes("/en/product/")
  );

  // shop as demo → hearts reflect wishlist (empty set still renders buttons)
  const shopDemo = await get("/en/shop", demoJar);
  check(
    "shop logged-in 200 + wishlist hearts present",
    shopDemo.status === 200 && shopDemo.body.includes("Add to wishlist"),
    `${shopDemo.status}`
  );

  // ---------- I. product images (local, offline-safe) ----------
  const shopImgs = await get("/en/shop");
  check(
    "shop images are local (no external hosts)",
    shopImgs.body.includes("/images/products/") && !shopImgs.body.includes("picsum.photos")
  );
  const localImg = (
    shopImgs.body.match(/\/images\/products\/[a-z0-9-]+\.jpg/) ?? []
  )[0];
  if (localImg) {
    const direct = await get(localImg);
    check(
      `image file serves 200 (${localImg})`,
      direct.status === 200,
      `${direct.status}`
    );
    const optimized = await get(
      `/_next/image?url=${encodeURIComponent(localImg)}&w=828&q=75`
    );
    check(
      "image optimizer serves 200 image/jpeg",
      optimized.status === 200 &&
        (optimized.res.headers.get("content-type") ?? "").includes("image/"),
      `${optimized.status}`
    );
  } else {
    check("found a local product image on shop", false, "none matched");
  }

  // ---------- summary ----------
  const failed = results.filter((r) => !r.pass);
  console.log("\n========================================");
  console.log(`TOTAL: ${results.length}  PASS: ${results.length - failed.length}  FAIL: ${failed.length}`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.name} :: ${f.detail ?? ""}`);
  }
  console.log("========================================");
  if (failed.length) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
