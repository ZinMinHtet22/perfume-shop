const BASE = "http://localhost:3000";
let failed = 0;

function check(name: string, ok: boolean, extra = "") {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` — ${extra}` : ""}`);
}

class Jar {
  cookies = new Map<string, string>();
  absorb(res: Response) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const first = line.split(";")[0];
      const eq = first.indexOf("=");
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (value) this.cookies.set(name, value);
      else this.cookies.delete(name);
    }
  }
  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}

async function get(path: string, jar?: Jar, redirect: "follow" | "manual" = "follow") {
  const res = await fetch(`${BASE}${path}`, {
    redirect,
    headers: jar ? { cookie: jar.header() } : {},
  });
  jar?.absorb(res);
  return { status: res.status, location: res.headers.get("location"), body: await res.text() };
}

async function login(jar: Jar, email: string, password: string): Promise<boolean> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: jar.header() } });
  jar.absorb(csrfRes);
  const token = ((await csrfRes.text()).match(/"csrfToken":"([^"]+)"/) ?? [])[1];
  if (!token) return false;
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { cookie: jar.header(), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: token, email, password, json: "true" }).toString(),
  });
  jar.absorb(res);
  const loc = res.headers.get("location") ?? "";
  return res.status === 302 && !loc.includes("error=");
}

async function submitAction(path: string, jar: Jar, html: string, marker: string, values: Record<string, string>) {
  const markerIdx = html.indexOf(marker);
  let formIdx = markerIdx >= 0 ? html.lastIndexOf("<form", markerIdx) : -1;
  if (formIdx < 0) formIdx = html.indexOf("<form");
  if (formIdx < 0) throw new Error(`no form for marker ${marker}`);
  const slice = html.slice(formIdx, formIdx + 4000);
  const fd = new FormData();
  const single = slice.match(/name="(\$ACTION_ID_[a-f0-9]+)"/);
  if (single) {
    fd.append(single[1], "");
  } else {
    const ref = slice.match(/name="(\$ACTION_REF_\d+)"/);
    const idm = slice.match(/name="(\$ACTION_\d+:0)" value="([^"]+)"/);
    const argm = slice.match(/name="(\$ACTION_\d+:1)" value="([^"]+)"/);
    const keym = slice.match(/name="(\$ACTION_KEY)" value="([^"]+)"/);
    if (!ref || !idm || !argm) throw new Error(`no action fields near ${marker}`);
    fd.append(ref[1], "");
    fd.append(idm[1], decodeEntities(idm[2]));
    fd.append(argm[1], decodeEntities(argm[2]));
    if (keym) fd.append(keym[1], keym[2]);
  }
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { cookie: jar.header() },
    body: fd,
  });
  jar.absorb(res);
  return { status: res.status, location: res.headers.get("location"), body: await res.text() };
}

async function main() {
  // ---- anonymous guards ----
  const anonAccount = await get("/en/account", undefined, "manual");
  check("anon /en/account → 307 /login", anonAccount.status === 307 && (anonAccount.location ?? "").includes("/login"), `${anonAccount.status} ${anonAccount.location}`);

  const anonLogin = await get("/en/login");
  check("anon /en/login shows form", anonLogin.status === 200 && anonLogin.body.includes('type="password"'));

  // ---- register flow ----
  const email = `verify+${Date.now()}@test.com`;
  const jar = new Jar();
  const reg = await get("/en/register", jar);
  const regRes = await submitAction("/en/register", jar, reg.body, "register", {
    name: "Verify User",
    email,
    password: "Verify123!",
    phone: "",
  });
  check("register → 303 + session", regRes.status === 303 && jar.cookies.size > 0, `${regRes.status} loc=${regRes.location}`);
  check("register lands on /account", (regRes.location ?? "").includes("/account"), regRes.location ?? "");

  // ---- navbar now points at account ----
  const home = await get("/en", jar);
  const accountHref = (home.body.match(/<a[^>]*href="([^"]+)"[^>]*>\s*Verify User/) ?? [])[1];
  check("navbar Account → /en/account + shows name", accountHref === "/en/account", accountHref ?? "no link");

  // ---- account page renders profile ----
  const acc = await get("/en/account", jar);
  check("logged-in /en/account 200 + email shown", acc.status === 200 && acc.body.includes(email), `${acc.status}`);

  // ---- login page no longer shows form when logged in ----
  const loginWhileIn = await get("/en/login", jar, "manual");
  check("/en/login logged-in → 307 away", loginWhileIn.status === 307, `${loginWhileIn.status} loc=${loginWhileIn.location}`);
  const regWhileIn = await get("/en/register", jar, "manual");
  check("/en/register logged-in → 307 away", regWhileIn.status === 307, `${regWhileIn.status} loc=${regWhileIn.location}`);

  // ---- sign out from account (signOutAction) ----
  const acc2 = await get("/en/account", jar);
  const signout = await submitAction("/en/account", jar, acc2.body, "sign out", {});
  check("signOutAction → 303", signout.status === 303, `${signout.status} loc=${signout.location}`);
  const sess = await get("/api/auth/session", jar);
  check("session cleared after signout", (await Promise.resolve(sess.body)) === "{}" || sess.body.includes('"user"') === false, sess.body.slice(0, 60));

  // ---- login lands: user → /account, admin → /admin ----
  const ujar = new Jar();
  check("user login", await login(ujar, email, "Verify123!"));
  const loginPage = await get("/en/login", ujar, "manual");
  check("user /en/login (already in) still 307", loginPage.status === 307, `${loginPage.status} loc=${loginPage.location}`);

  const ajar = new Jar();
  check("admin login", await login(ajar, "admin@perfumeshop.com", "Admin123!"));
  const adminPage = await get("/admin", ajar);
  check("/admin renders dashboard for admin", adminPage.status === 200 && adminPage.body.includes("/admin/coupons"), `${adminPage.status}`);
  const adminAcct = await get("/en/account", ajar);
  check("admin /en/account shows Admin panel link", adminAcct.status === 200 && adminAcct.body.includes('href="/admin"'), `${adminAcct.status}`);

  // ---- admin profile security (change password) ----
  const prof = await get("/admin/profile", ajar);
  check(
    "admin /admin/profile 200 + security form",
    prof.status === 200 &&
      prof.body.includes('name="current"') &&
      prof.body.includes("Security"),
    `${prof.status}`
  );
  const wrong = await submitAction("/admin/profile", ajar, prof.body, 'name="current"', {
    current: "WrongPass1",
    next: "TempAdmin123!",
    confirm: "TempAdmin123!",
  });
  check(
    "wrong current password rejected",
    wrong.body.includes("Current password is incorrect."),
    `${wrong.status}`
  );

  let changed = false;
  try {
    const fresh = await get("/admin/profile", ajar);
    const okRes = await submitAction("/admin/profile", ajar, fresh.body, 'name="current"', {
      current: "Admin123!",
      next: "TempAdmin123!",
      confirm: "TempAdmin123!",
    });
    changed = okRes.body.includes("Password updated successfully.");
    check("password change succeeds", changed, `${okRes.status}`);
    if (changed) {
      const oldJar = new Jar();
      const oldOk = await login(oldJar, "admin@perfumeshop.com", "Admin123!");
      check("old password rejected after change", !oldOk);
      const newOk = await login(new Jar(), "admin@perfumeshop.com", "TempAdmin123!");
      check("new password accepted", newOk);
    }
  } finally {
    if (changed) {
      const fresh2 = await get("/admin/profile", ajar);
      const back = await submitAction("/admin/profile", ajar, fresh2.body, 'name="current"', {
        current: "TempAdmin123!",
        next: "Admin123!",
        confirm: "Admin123!",
      });
      const restored = back.body.includes("Password updated successfully.");
      check("admin password restored", restored);
      if (!restored) console.log("CRITICAL: restore failed, reset admin@perfumeshop.com password manually");
    }
  }

  const adminSignout = await submitAction("/en/account", ajar, adminAcct.body, "sign out", {});
  check("admin signOutAction works", adminSignout.status === 303, `${adminSignout.status}`);
  const adminSess = await get("/api/auth/session", ajar);
  check("admin session cleared", !adminSess.body.includes('"user"'), adminSess.body.slice(0, 60));

  // ---- server-action login redirect (role-based) via login form ----
  const ljar = new Jar();
  const lpage = await get("/en/login", ljar);
  const lres = await submitAction("/en/login", ljar, lpage.body, "login", {
    email,
    password: "Verify123!",
  });
  check("loginAction user → /account", lres.status === 303 && (lres.location ?? "").includes("/account"), `${lres.status} loc=${lres.location}`);

  const ljar2 = new Jar();
  const lpage2 = await get("/en/login", ljar2);
  const lres2 = await submitAction("/en/login", ljar2, lpage2.body, "login", {
    email: "admin@perfumeshop.com",
    password: "Admin123!",
  });
  check("loginAction admin → /admin", lres2.status === 303 && (lres2.location ?? "").includes("/admin"), `${lres2.status} loc=${lres2.location}`);

  console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
