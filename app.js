(function () {
  const nativeAlert = window.alert.bind(window);
  window.alert = function (message) {
    const text = message == null ? "" : String(message);
    nativeAlert(window.meejobT ? window.meejobT(text) : text);
  };
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = function (message) {
    const text = message == null ? "" : String(message);
    return nativeConfirm(window.meejobT ? window.meejobT(text) : text);
  };
})();
let currentUser = null;
    let currentProfile = null;
    let currentIsAdmin = false;
    let authMode = "login";
    let allFreelancers = [];
    let currentChatUser = null;
    let currentChatChannel = null;
    let messageNotificationChannel = null;
    let renderedMessageIds = new Set();
    let freelancerMap = new Map();
    /* =========================
       PROJECTS
    ========================= */
    let allProjects = [];
    let myApplicationMap = new Map();
    let currentProjectDetail = null;
    let editingProjectId = null;
    let myProjectsCache = [];
    let dashboardTab = "projects";
    /* =========================
       MEMBERSHIP
    ========================= */
    const MEMBERSHIP_PLANS = {
      monthly: { amount: 10, label: "1 month", period: "month" },
      quarterly: { amount: 25, label: "3 months", period: "3 months" },
      yearly: { amount: 60, label: "1 year", period: "year" }
    };
    const MEMBERSHIP_FACEBOOK_URL =
      "https://www.facebook.com/profile.php?id=61595574394777";

    // Payment QR images. Prices are quoted in USD; LAK and THB are
    // approximate conversions rounded up so the transfer never falls short.
    // Update the rates if the bank rate moves significantly.
    const PAYMENT_CURRENCIES = {
      usd: {
        label: "USD",
        code: "USD",
        image: "payment-qr-usd.png",
        rate: 1,
        step: 1
      },
      lak: {
        label: "LAK",
        code: "LAK",
        image: "payment-qr-lak.png",
        rate: 21000,
        step: 5000
      },
      thb: {
        label: "THB",
        code: "THB",
        image: "payment-qr-thb.png",
        rate: 36,
        step: 10
      }
    };
    let membershipInfo = null;
    let membershipAvailable = false;
    let selectedMembershipPlan = "monthly";
    let selectedPaymentMethod = "qr";
    let selectedQrCurrency = "usd";
    /* =========================
       INITIALIZE
    ========================= */
    document.addEventListener(
      "DOMContentLoaded",
      async function () {
        const searchInput =
          document.getElementById(
            "freelancerSearch"
          );
        if (searchInput) {
          searchInput.addEventListener(
            "input",
            searchFreelancers
          );
        }
        const chatInput =
          document.getElementById(
            "chatInput"
          );
        if (chatInput) {
          chatInput.addEventListener(
            "keydown",
            handleChatKeydown
          );
        }
        await checkCurrentUser();
        maybeShowPreviewGate();
        fillProvinceOptions("heroProvince", true);
        fillProvinceOptions("jobProvinceFilter", true);
        fillProvinceOptions("jobProvince", false);
        await loadJobs();
        await loadFreelancers();
        await loadProjects();
      }
    );
    /* =========================
       AUTH STATE
    ========================= */
    async function checkCurrentUser() {
      try {
        const {
          data,
          error
        } =
          await supabaseClient.auth.getSession();
        if (error) {
          console.error(
            "Session error:",
            error
          );
          return;
        }
        currentUser =
          data.session
            ? data.session.user
            : null;
        if (currentUser) {
          await loadCurrentProfile();
          await applyPendingSignupProfile();
          await loadAdminStatus();
          await updateUnreadCount();
          await startMessageNotifications();
        } else {
          currentIsAdmin = false;
        }
        updateNavigation();
      } catch (error) {
        console.error(
          "Authentication check error:",
          error
        );
      }
    }

    async function loadAdminStatus() {
      currentIsAdmin = false;
      if (!currentUser) {
        return;
      }
      try {
        const { data, error } =
          await supabaseClient.rpc("is_admin");
        if (!error) {
          currentIsAdmin = data === true;
        }
      } catch (error) {
        // The function is added by supabase/meejob.sql.
        currentIsAdmin = false;
      }
    }

    supabaseClient.auth.onAuthStateChange(
      async function (event, session) {
        currentUser =
          session
            ? session.user
            : null;
        if (currentUser) {
          await loadCurrentProfile();
          await applyPendingSignupProfile();
          await loadAdminStatus();
          updateNavigation();
          await updateUnreadCount();
          await startMessageNotifications();
        } else {
          currentProfile = null;
          currentIsAdmin = false;
          myApplicationMap = new Map();
          await closeChat();
          await closeMessageNotifications();
          closeModal("messagesModal");
          closeModal("projectDetailModal");
          updateNavigation();
        }
        await loadFreelancers();
        await loadProjects();
      }
    );
    /* =========================
       NAVIGATION
    ========================= */
    function updateNavigation() {
      const loggedOutMenu =
        document.getElementById(
          "loggedOutMenu"
        );
      const loggedInMenu =
        document.getElementById(
          "loggedInMenu"
        );
      const navUserName =
        document.getElementById(
          "navUserName"
        );
      const postProjectButton =
        document.getElementById(
          "postProjectButton"
        );
      const postJobButton =
        document.getElementById(
          "postJobButton"
        );
      const projectLoginNote =
        document.getElementById(
          "projectLoginNote"
        );
      const isClient =
        currentProfile &&
        currentProfile.role === "client";
      if (postJobButton) {
        postJobButton.style.display =
          !currentUser || currentIsAdmin || isClient
            ? ""
            : "none";
      }
      if (currentUser) {
        loggedOutMenu.style.display =
          "none";
        loggedInMenu.style.display =
          "flex";
        navUserName.textContent =
          currentProfile &&
          currentProfile.name
            ? currentProfile.name
            : "Account";
        const dashboardButton =
          document.getElementById(
            "dashboardButton"
          );
        if (dashboardButton) {
          dashboardButton.textContent =
            currentProfile &&
            currentProfile.role === "freelancer"
              ? "My Applications"
              : "My Projects";
        }
        if (isClient) {
          if (postProjectButton) {
            postProjectButton.style.display =
              "inline-block";
          }
          if (projectLoginNote) {
            projectLoginNote.style.display =
              "none";
          }
        } else {
          if (postProjectButton) {
            postProjectButton.style.display =
              "none";
          }
          if (projectLoginNote) {
            projectLoginNote.style.display =
              "none";
          }
        }
      } else {
        loggedOutMenu.style.display =
          "flex";
        loggedInMenu.style.display =
          "none";
        navUserName.textContent = "";
        updateUnreadBadge(0);
        if (postProjectButton) {
          postProjectButton.style.display =
            "none";
        }
        if (projectLoginNote) {
          projectLoginNote.style.display =
            "block";
        }
      }
      const mobileAccount =
        document.getElementById(
          "mobileMenuAccount"
        );
      if (mobileAccount) {
        mobileAccount.innerHTML =
          currentUser
            ? `
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="toggleMobileMenu(false); openMembership();">
                Membership
              </button>
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="toggleMobileMenu(false); openDashboard();">
                Dashboard
              </button>
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="toggleMobileMenu(false); openMessages();">
                Messages
              </button>
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="toggleMobileMenu(false); openProfile();">
                Profile
              </button>
              <button type="button" class="btn btn-danger btn-sm"
                onclick="toggleMobileMenu(false); logout();">
                Log out
              </button>
            `
            : `
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="toggleMobileMenu(false); openAuth('login');">
                Log in
              </button>
              <button type="button" class="btn btn-primary btn-sm"
                onclick="toggleMobileMenu(false); openAuth('signup');">
                Get started
              </button>
            `;
      }
      updateMembershipNav();
    }
    /* =========================
       AUTH MODAL
    ========================= */
    function openAuth(mode) {
      authMode = mode;
      document.getElementById(
        "authModal"
      ).style.display = "flex";
      updateAuthModal();
      if (window.applyI18n) {
        window.applyI18n();
      }
    }
    function updateAuthModal() {
      const title =
        document.getElementById(
          "authTitle"
        );
      const nameGroup =
        document.getElementById(
          "signupNameGroup"
        );
      const roleGroup =
        document.getElementById(
          "signupRoleGroup"
        );
      const submitButton =
        document.getElementById(
          "authSubmitButton"
        );
      const switchText =
        document.getElementById(
          "authSwitchText"
        );
      const switchButton =
        document.getElementById(
          "authSwitchButton"
        );
      if (authMode === "signup") {
        title.textContent =
          "Create Your Account";
        nameGroup.style.display =
          "block";
        roleGroup.style.display =
          "block";
        submitButton.textContent =
          "Sign Up";
        switchText.textContent =
          "Already have an account?";
        switchButton.textContent =
          "Log In";
      } else {
        title.textContent =
          "Log In";
        nameGroup.style.display =
          "none";
        roleGroup.style.display =
          "none";
        submitButton.textContent =
          "Log In";
        switchText.textContent =
          "Don't have an account?";
        switchButton.textContent =
          "Sign Up";
      }
      const forgotRow =
        document.getElementById(
          "forgotPasswordRow"
        );
      if (forgotRow) {
        forgotRow.style.display =
          authMode === "signup"
            ? "none"
            : "flex";
      }
      const passwordInput =
        document.getElementById(
          "authPassword"
        );
      if (passwordInput) {
        passwordInput.setAttribute(
          "autocomplete",
          authMode === "signup"
            ? "new-password"
            : "current-password"
        );
      }
      document.getElementById(
        "authStatus"
      ).textContent = "";
    }
    function switchAuthMode() {
      authMode =
        authMode === "login"
          ? "signup"
          : "login";
      updateAuthModal();
    }
    async function submitAuth() {
      const email =
        document.getElementById(
          "authEmail"
        ).value.trim().toLowerCase();
      const password =
        document.getElementById(
          "authPassword"
        ).value;
      const status =
        document.getElementById(
          "authStatus"
        );
      if (!email || !password) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Please enter your email and password.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Please enter a valid email address.";
        return;
      }
      if (password.length < 6) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Use at least 6 characters.";
        return;
      }
      status.style.color =
        "#2563eb";
      status.textContent =
        "Please wait...";
      try {
        if (authMode === "signup") {
          const name =
            document.getElementById(
              "authName"
            ).value.trim();
          const role =
            document.getElementById(
              "authRole"
            ).value;
          if (!name) {
            status.style.color =
              "#dc2626";
            status.textContent =
              "Please enter your name.";
            return;
          }
          const {
            data,
            error
          } =
            await supabaseClient.auth.signUp({
              email: email,
              password: password,
              options: {
                data: {
                  name: name,
                  role: role
                }
              }
            });
          if (error) {
            throw error;
          }
          if (data.user) {
            if (data.session) {
              currentUser = data.user;
              const profileApplied = await applySignupProfile(
                data.user,
                name,
                role
              );
              try {
                window.localStorage.removeItem(PENDING_SIGNUP_KEY);
              } catch (storageError) {
                /* storage may be unavailable */
              }
              await loadCurrentProfile();
              updateNavigation();
              await updateUnreadCount();
              await startMessageNotifications();
              await loadFreelancers();
              await loadProjects();
              if (profileApplied) {
                status.style.color =
                  "#16a34a";
                status.textContent =
                  "Account created. You are logged in.";
                setTimeout(
                  function () {
                    closeModal(
                      "authModal"
                    );
                  },
                  700
                );
              } else {
                status.style.color =
                  "#b45309";
                status.textContent =
                  "Account created. Open Profile, choose your account type and save it once.";
              }
            } else {
              try {
                window.localStorage.setItem(
                  PENDING_SIGNUP_KEY,
                  JSON.stringify({
                    email: email,
                    name: name,
                    role: normalizeRole(role)
                  })
                );
              } catch (storageError) {
                /* storage may be unavailable */
              }
              status.style.color =
                "#16a34a";
              status.textContent =
                "Account created. Check your email to confirm your address, then log in.";
            }
          }
        } else {
          const {
            data,
            error
          } =
            await supabaseClient.auth.signInWithPassword({
              email: email,
              password: password
            });
          if (error) {
            throw error;
          }
          currentUser =
            data.user;
          await loadCurrentProfile();
          await applyPendingSignupProfile();
          updateNavigation();
          await updateUnreadCount();
          await startMessageNotifications();
          status.style.color =
            "#16a34a";
          status.textContent =
            "Login successful.";
          await loadFreelancers();
          await loadProjects();
          setTimeout(
            function () {
              closeModal(
                "authModal"
              );
            },
            700
          );
        }
      } catch (error) {
        console.error(
          "Authentication error:",
          error
        );
        status.style.color =
          "#dc2626";
        status.textContent =
          error.message ||
          "Something went wrong.";
      }
    }
    /* =========================
       LOGOUT
    ========================= */
    async function logout() {
      const confirmed =
        window.confirm(
          "Are you sure you want to log out?"
        );
      if (!confirmed) {
        return;
      }
      try {
        await closeChat();
        await closeMessageNotifications();
        closeModal("messagesModal");
        closeModal("profileModal");
        closeModal("projectDetailModal");
        const {
          error
        } =
          await supabaseClient.auth.signOut();
        if (error) {
          throw error;
        }
        currentUser = null;
        currentProfile = null;
        myApplicationMap = new Map();
        updateNavigation();
        await loadFreelancers();
        await loadProjects();
      } catch (error) {
        console.error(error);
        alert(
          error.message ||
          "Could not log out."
        );
      }
    }
    /* =========================
       PROFILE
    ========================= */
    // Older databases may not have the newer columns yet. These helpers let
    // the app keep working (without the new fields) until meejob.sql is run.
    function isSchemaMissing(error) {
      const message = String((error && error.message) || "");
      return /column|does not exist|could not find|schema cache|PGRST20[45]|42P01|42703/i.test(
        message
      );
    }
    function requireChangedRow(result, message) {
      if (result && result.error) {
        throw result.error;
      }
      const data = result ? result.data : null;
      if (!data || (Array.isArray(data) && !data.length)) {
        const error = new Error(
          message || "Could not save changes."
        );
        error.code = "NO_ROWS";
        throw error;
      }
      return data;
    }
    async function fetchPublicProfile(id) {
      let result = await supabaseClient
        .from("profiles")
        .select("id, name, role, bio, skills, rate")
        .eq("id", id)
        .maybeSingle();
      if (result.error && isSchemaMissing(result.error)) {
        result = await supabaseClient
          .from("profiles")
          .select("id, name, role, bio, skills")
          .eq("id", id)
          .maybeSingle();
      }
      return result;
    }
    async function fetchPublicProfiles() {
      let result = await supabaseClient
        .from("profiles")
        .select("id, name, role, bio, skills, rate");
      if (result.error && isSchemaMissing(result.error)) {
        result = await supabaseClient
          .from("profiles")
          .select("id, name, role, bio, skills");
      }
      return result;
    }
    // Phone / Facebook / portfolio live in a members-only table, so they are
    // never downloaded by anonymous visitors.
    async function loadProfileContacts(profileId) {
      if (!profileId) {
        return null;
      }
      try {
        const { data, error } = await supabaseClient
          .from("profile_contacts")
          .select("phone, facebook, portfolio")
          .eq("profile_id", profileId)
          .maybeSingle();
        if (error) {
          if (isSchemaMissing(error)) {
            return null;
          }
          console.error("Contact loading error:", error);
          return null;
        }
        return data || {};
      } catch (error) {
        console.error("Contact loading exception:", error);
        return null;
      }
    }
    async function loadCurrentProfile() {
      if (!currentUser) {
        return;
      }
      try {
        const { data, error } = await fetchPublicProfile(currentUser.id);
        if (error) {
          console.error(
            "Profile loading error:",
            error
          );
          return;
        }
        if (!data) {
          const metadata =
            currentUser.user_metadata || {};
          const fallbackProfile = {
            id: currentUser.id,
            name: String(
              metadata.name ||
                (currentUser.email || "New user").split("@")[0]
            ).trim(),
            role: String(
              metadata.role || "client"
            )
              .trim()
              .toLowerCase(),
            bio: "",
            skills: "",
            rate: ""
          };
          let created = await supabaseClient
            .from("profiles")
            .upsert(fallbackProfile)
            .select("id, name, role, bio, skills, rate")
            .maybeSingle();
          if (created.error && isSchemaMissing(created.error)) {
            created = await supabaseClient
              .from("profiles")
              .upsert({
                id: fallbackProfile.id,
                name: fallbackProfile.name,
                role: fallbackProfile.role,
                bio: "",
                skills: ""
              })
              .select("id, name, role, bio, skills")
              .maybeSingle();
          }
          if (created.error) {
            console.error(
              "Could not create profile:",
              created.error
            );
          }
          currentProfile = normalizeProfile(
            created.data || fallbackProfile
          );
        } else {
          currentProfile =
            normalizeProfile(data);
        }
        const contacts = await loadProfileContacts(currentUser.id);
        if (contacts) {
          currentProfile.phone = String(contacts.phone || "").trim();
          currentProfile.facebook = String(contacts.facebook || "").trim();
          currentProfile.portfolio = String(contacts.portfolio || "").trim();
        }
        await loadMembershipInfo();
      } catch (error) {
        console.error(error);
      }
    }

    /* ==========================================================================
       MEMBERSHIP STATE
       The database is the source of truth. If membership.sql has not been run
       yet, the site stays usable and the membership screen explains the setup
       step instead of blocking every action.
    ========================================================================== */

    async function loadMembershipInfo() {
      membershipInfo = null;
      membershipAvailable = false;
      if (!currentUser) {
        return;
      }
      try {
        const { data, error } = await supabaseClient.rpc("get_my_membership");
        if (error) {
          console.warn("Membership status unavailable:", error.message || error);
          return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        membershipInfo = row || {
          trial_ends_at: null,
          membership_plan: null,
          membership_started_at: null,
          membership_expires_at: null,
          is_active: false
        };
        membershipAvailable = true;
      } catch (error) {
        console.warn("Membership status unavailable:", error);
      }
    }

    function membershipDaysLeft(value) {
      if (!value) {
        return 0;
      }
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) {
        return 0;
      }
      return Math.max(0, Math.ceil((time - Date.now()) / 86400000));
    }

    function membershipSnapshot() {
      if (!currentUser) {
        return { state: "guest", active: false, days: 0, until: null };
      }
      if (currentIsAdmin) {
        return { state: "admin", active: true, days: 0, until: null };
      }
      if (!membershipAvailable) {
        return { state: "unknown", active: true, days: 0, until: null };
      }

      const now = Date.now();
      const paidTime = membershipInfo && membershipInfo.membership_expires_at
        ? new Date(membershipInfo.membership_expires_at).getTime()
        : 0;
      const trialTime = membershipInfo && membershipInfo.trial_ends_at
        ? new Date(membershipInfo.trial_ends_at).getTime()
        : 0;
      const activeUntil = Math.max(
        Number.isNaN(paidTime) ? 0 : paidTime,
        Number.isNaN(trialTime) ? 0 : trialTime
      );

      if (activeUntil > now) {
        const paidActive =
          !Number.isNaN(paidTime) && paidTime > now && paidTime >= trialTime;
        return {
          state: paidActive ? "member" : "trial",
          active: true,
          plan: membershipInfo ? membershipInfo.membership_plan : null,
          until: new Date(activeUntil).toISOString(),
          days: membershipDaysLeft(new Date(activeUntil).toISOString())
        };
      }

      return {
        state: "expired",
        active: false,
        until:
          (membershipInfo &&
            (membershipInfo.membership_expires_at ||
              membershipInfo.trial_ends_at)) ||
          null,
        days: 0
      };
    }

    function hasActiveMembership() {
      return membershipSnapshot().active;
    }

    function requireMembership() {
      if (!currentUser) {
        openAuth("login");
        return false;
      }
      if (hasActiveMembership()) {
        return true;
      }
      alert("An active membership is required. Choose a plan to continue.");
      openMembership();
      return false;
    }

    function membershipPlanLabel(plan) {
      return MEMBERSHIP_PLANS[plan] ? MEMBERSHIP_PLANS[plan].label : "1 month";
    }

    function membershipStatusLabel(status) {
      const value = String(status || "").toLowerCase();
      if (value === "approved") {
        return "Approved";
      }
      if (value === "rejected") {
        return "Rejected";
      }
      if (value === "cancelled") {
        return "Cancelled";
      }
      return "Pending";
    }
    const PENDING_SIGNUP_KEY = "meejob_pending_signup";
    function normalizeRole(role) {
      return String(role || "").trim().toLowerCase() === "client"
        ? "client"
        : "freelancer";
    }
    async function applySignupProfile(user, name, role) {
      if (!user) {
        return false;
      }
      const result = await supabaseClient
        .from("profiles")
        .upsert({
          id: user.id,
          name: String(name || "").trim(),
          role: normalizeRole(role)
        });
      if (result.error) {
        console.error("Could not apply the chosen signup role:", result.error);
        return false;
      }
      return true;
    }
    async function applyPendingSignupProfile() {
      if (!currentUser || !currentProfile) {
        return;
      }
      let pending = null;
      try {
        pending = JSON.parse(
          window.localStorage.getItem(PENDING_SIGNUP_KEY) || "null"
        );
      } catch (error) {
        pending = null;
      }
      if (!pending) {
        return;
      }
      const pendingEmail = String(pending.email || "").trim().toLowerCase();
      const userEmail = String(currentUser.email || "").trim().toLowerCase();
      if (!pendingEmail || pendingEmail !== userEmail) {
        return;
      }
      const wantedRole = normalizeRole(pending.role);
      const wantedName = String(pending.name || "").trim();
      if (
        currentProfile.role !== wantedRole ||
        (wantedName && currentProfile.name !== wantedName)
      ) {
        const saved = await applySignupProfile(
          currentUser,
          wantedName || currentProfile.name,
          wantedRole
        );
        if (saved) {
          await loadCurrentProfile();
        } else {
          return;
        }
      }
      try {
        window.localStorage.removeItem(PENDING_SIGNUP_KEY);
      } catch (error) {
        /* storage may be unavailable */
      }
    }
    async function openProfile() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      await loadCurrentProfile();
      document.getElementById(
        "profileName"
      ).value =
        currentProfile?.name || "";
      document.getElementById(
        "profileEmail"
      ).value =
        currentUser.email || "";
      const profileRoleInput = document.getElementById("profileRole");
      profileRoleInput.value = currentProfile?.role || "client";
      profileRoleInput.disabled = true;
      document.getElementById(
        "profileBio"
      ).value =
        currentProfile?.bio || "";
      document.getElementById(
        "profileSkills"
      ).value =
        currentProfile?.skills || "";
      document.getElementById(
        "profileRate"
      ).value =
        currentProfile?.rate || "";
      document.getElementById(
        "profilePhone"
      ).value =
        currentProfile?.phone || "";
      document.getElementById(
        "profileFacebook"
      ).value =
        currentProfile?.facebook || "";
      document.getElementById(
        "profilePortfolio"
      ).value =
        currentProfile?.portfolio || "";
      document.getElementById(
        "profileStatus"
      ).textContent = "";
      renderMembershipStatus();
      document.getElementById(
        "profileModal"
      ).style.display = "flex";
    }
    async function saveProfile() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      const name =
        document.getElementById(
          "profileName"
        ).value.trim();
      const formRole =
        document.getElementById(
          "profileRole"
        ).value;
      // Account type is permanent. Ignore any tampering with the disabled field.
      const role =
        currentProfile && currentProfile.role
          ? currentProfile.role
          : normalizeRole(formRole);
      const bio =
        document.getElementById(
          "profileBio"
        ).value.trim();
      const skills =
        document.getElementById(
          "profileSkills"
        ).value.trim();
      const rate =
        document.getElementById(
          "profileRate"
        ).value.trim();
      const phone =
        document.getElementById(
          "profilePhone"
        ).value.trim();
      const facebook =
        document.getElementById(
          "profileFacebook"
        ).value.trim();
      const portfolio =
        document.getElementById(
          "profilePortfolio"
        ).value.trim();
      const status =
        document.getElementById(
          "profileStatus"
        );
      if (!name) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Name cannot be empty.";
        return;
      }
      status.style.color =
        "#2563eb";
      status.textContent =
        "Saving...";
      try {
        // Public fields only. Contact details never touch public.profiles.
        let rateSaved = true;
        let result = await supabaseClient
          .from("profiles")
          .upsert({
            id: currentUser.id,
            name: name,
            role: role,
            bio: bio,
            skills: skills,
            rate: rate
          });
        if (result.error && isSchemaMissing(result.error)) {
          rateSaved = false;
          result = await supabaseClient
            .from("profiles")
            .upsert({
              id: currentUser.id,
              name: name,
              role: role,
              bio: bio,
              skills: skills
            });
        }
        if (result.error) {
          throw result.error;
        }

        // Private fields: readable by members, writable only by the owner.
        let contactsSaved = false;
        const contactsResult = await supabaseClient
          .from("profile_contacts")
          .upsert({
            profile_id: currentUser.id,
            phone: phone,
            facebook: facebook,
            portfolio: portfolio,
            updated_at: new Date().toISOString()
          });
        if (!contactsResult.error) {
          contactsSaved = true;
        } else if (isSchemaMissing(contactsResult.error)) {
          contactsSaved = false;
        } else {
          console.error(
            "Contact save error:",
            contactsResult.error
          );
          contactsSaved = false;
        }

        currentProfile = {
          id: currentUser.id,
          name: name,
          role: role,
          bio: bio,
          skills: skills,
          rate: rateSaved ? rate : "",
          phone: contactsSaved ? phone : "",
          facebook: contactsSaved ? facebook : "",
          portfolio: contactsSaved ? portfolio : ""
        };
        const sqlNeeded =
          !rateSaved || !contactsSaved;
        status.style.color =
          sqlNeeded ? "#b45309" : "#16a34a";
        if (!rateSaved && !contactsSaved) {
          status.textContent =
            "Profile saved. Expected pay and contact details need supabase/meejob.sql to be enabled.";
        } else if (!contactsSaved) {
          status.textContent =
            "Profile saved. Contact details need supabase/meejob.sql to be enabled.";
        } else if (!rateSaved) {
          status.textContent =
            "Profile saved. Expected pay needs supabase/meejob.sql to be enabled.";
        } else {
          status.textContent =
            "Profile saved successfully.";
        }
        updateNavigation();
        await loadFreelancers();
        await loadProjects();
        await loadJobs();
        if (!sqlNeeded) {
          setTimeout(
            function () {
              closeModal(
                "profileModal"
              );
            },
            700
          );
        }
      } catch (error) {
        console.error(error);
        status.style.color =
          "#dc2626";
        status.textContent =
          error.message ||
          "Could not save profile.";
      }
    }
    /* =========================
       FREELANCERS
    ========================= */
    async function loadFreelancers() {
      const container =
        document.getElementById(
          "freelancerList"
        );
      if (!container) {
        return;
      }
      container.innerHTML =
        '<div class="empty-message">Loading freelancers...</div>';
      try {
        const {
          data,
          error
        } = await fetchPublicProfiles();
        if (error) {
          throw error;
        }
        allFreelancers =
          (data || []).map(
            normalizeProfile
          ).filter(
            function (profile) {
              return (
                profile.role &&
                profile.role.toLowerCase() ===
                "freelancer"
              );
            }
          );
        freelancerMap =
          new Map();
        allFreelancers.forEach(
          function (profile) {
            freelancerMap.set(
              profile.id,
              profile
            );
          }
        );
        renderFreelancers(
          allFreelancers
        );
        updateHeroStats();
      } catch (error) {
        console.error(
          "Loading freelancers error:",
          error
        );
        container.innerHTML =
          '<div class="empty-message">' +
          'Could not load freelancers.' +
          '</div>';
      }
    }
    function renderFreelancers(
      freelancers
    ) {
      const container =
        document.getElementById(
          "freelancerList"
        );
      if (!freelancers.length) {
        container.innerHTML =
          '<div class="empty-message">' +
          'No freelancers found.' +
          '</div>';
        return;
      }
      container.innerHTML = "";
      freelancers.forEach(
        function (profile) {
          const card =
            document.createElement(
              "div"
            );
          card.className =
            "freelancer-card";
          const name =
            profile.name ||
            "Unnamed Freelancer";
          const firstLetter =
            escapeHTML(
              name
                .charAt(0)
                .toUpperCase()
            );
          const bio =
            profile.bio &&
            profile.bio.trim()
              ? profile.bio
              : "No bio available.";
          const skills =
            profile.skills &&
            profile.skills.trim()
              ? profile.skills
              : "No skills listed.";
          card.innerHTML = `
            <div class="freelancer-avatar">
              ${firstLetter}
            </div>
            <h3 data-no-i18n>
              ${escapeHTML(name)}
            </h3>
            <span class="role">
              Freelancer
            </span>
            <p ${profile.bio && profile.bio.trim() ? "data-no-i18n" : ""}>
              ${escapeHTML(bio)}
            </p>
            <div class="skills">
              <strong>Skills:</strong>
              <span ${profile.skills && profile.skills.trim() ? "data-no-i18n" : ""}>${escapeHTML(skills)}</span>
            </div>
            ${profile.rate ? `<div class="rate-tag" data-no-i18n>${escapeHTML(profile.rate)}</div>` : ""}
            <div class="card-buttons">
              <button
                type="button"
                class="btn btn-secondary view-profile-btn"
                data-profile-id="${escapeHTML(profile.id)}"
              >
                View Profile
              </button>
              <button
                type="button"
                class="btn btn-primary message-profile-btn"
                data-profile-id="${escapeHTML(profile.id)}"
              >
                Message
              </button>
            </div>
          `;
          const viewButton =
            card.querySelector(
              ".view-profile-btn"
            );
          viewButton.addEventListener(
            "click",
            function () {
              const profileId =
                this.getAttribute(
                  "data-profile-id"
                );
              const selectedProfile =
                freelancerMap.get(
                  profileId
                );
              if (selectedProfile) {
                viewFreelancer(
                  selectedProfile
                );
              }
            }
          );
          const messageButton =
            card.querySelector(
              ".message-profile-btn"
            );
          messageButton.addEventListener(
            "click",
            function () {
              const profileId =
                this.getAttribute(
                  "data-profile-id"
                );
              const selectedProfile =
                freelancerMap.get(
                  profileId
                );
              if (!selectedProfile) {
                alert(
                  "Freelancer profile could not be found."
                );
                return;
              }
              openChat(
                selectedProfile
              );
            }
          );
          container.appendChild(
            card
          );
        }
      );
    }
    function searchFreelancers() {
      const input =
        document.getElementById(
          "freelancerSearch"
        );
      if (!input) {
        return;
      }
      const search =
        input.value
          .trim()
          .toLowerCase();
      if (!search) {
        renderFreelancers(
          allFreelancers
        );
        return;
      }
      const filtered =
        allFreelancers.filter(
          function (profile) {
            const name =
              profile.name || "";
            const bio =
              profile.bio || "";
            const skills =
              profile.skills || "";
            return (
              name
                .toLowerCase()
                .includes(search)
              ||
              bio
                .toLowerCase()
                .includes(search)
              ||
              skills
                .toLowerCase()
                .includes(search)
            );
          }
        );
      renderFreelancers(
        filtered
      );
    }
    async function viewFreelancerById(profileId) {
      const id = String(profileId || "");
      let profile = allFreelancers.find(function (item) {
        return item.id === id;
      });
      if (!profile && freelancerMap.has(id)) {
        profile = freelancerMap.get(id);
      }
      if (!profile) {
        const { data, error } = await fetchPublicProfile(id);
        if (error || !data) {
          alert("Freelancer profile could not be found.");
          return;
        }
        profile = data;
      }
      await viewFreelancer(profile);
    }
    async function viewFreelancer(
      profile
    ) {
      if (!currentUser) {
        showPreviewGate();
        return;
      }
      const detail =
        document.getElementById(
          "freelancerDetail"
        );
      detail.innerHTML =
        '<div class="empty-message">Loading profile...</div>';
      openModal("detailModal");

      // Contact details are stored in a members-only table.
      const contacts = await loadProfileContacts(profile.id);
      const merged = Object.assign(
        {},
        profile,
        contacts || {}
      );

      const name =
        merged.name ||
        "Unnamed Freelancer";
      const bio =
        merged.bio ||
        "No bio available.";
      const skills =
        merged.skills ||
        "No skills listed.";
      const rate = merged.rate || "";
      const phone = merged.phone || "";
      const phoneDigits = phone.replace(/[^\d+]/g, "");
      const facebook = safeProfileLink(merged.facebook);
      const portfolio = safeProfileLink(merged.portfolio);
      detail.innerHTML = `
        <div class="detail-header">
          <h2 data-no-i18n>
            ${escapeHTML(name)}
          </h2>
          <span class="role">
            ${merged.role === "client" ? "Client" : "Freelancer"}
          </span>
        </div>
        ${rate ? `
        <div class="detail-section">
          <h4>
            Expected pay
          </h4>
          <p data-no-i18n>
            ${escapeHTML(rate)}
          </p>
        </div>` : ""}
        <div class="detail-section">
          <h4>
            About
          </h4>
          <p ${merged.bio ? "data-no-i18n" : ""}>
            ${escapeHTML(bio)}
          </p>
        </div>
        <div class="detail-section">
          <h4>
            Skills
          </h4>
          <p ${merged.skills ? "data-no-i18n" : ""}>
            ${escapeHTML(skills)}
          </p>
        </div>
        ${phone ? `
        <div class="detail-section">
          <h4>
            Phone
          </h4>
          <p data-no-i18n>
            ${phoneDigits ? `<a href="tel:${escapeHTML(phoneDigits)}">${escapeHTML(phone)}</a>` : escapeHTML(phone)}
          </p>
        </div>` : ""}
        ${facebook ? `
        <div class="detail-section">
          <h4>
            Facebook
          </h4>
          <p data-no-i18n>
            <a href="${escapeHTML(facebook)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHTML(merged.facebook)}</a>
          </p>
        </div>` : ""}
        ${portfolio ? `
        <div class="detail-section">
          <h4>
            Portfolio
          </h4>
          <p data-no-i18n>
            <a href="${escapeHTML(portfolio)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHTML(merged.portfolio)}</a>
          </p>
        </div>` : ""}
        <div class="modal-actions">
          <button
            type="button"
            id="detailMessageButton"
            class="btn btn-primary"
          >
            Message
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            onclick='closeModal("detailModal")'
          >
            Close
          </button>
        </div>
      `;
      const detailMessageButton =
        document.getElementById(
          "detailMessageButton"
        );
      detailMessageButton.addEventListener(
        "click",
        function () {
          closeModal(
            "detailModal"
          );
          openChat(
            merged
          );
        }
      );
    }
    function scrollToFreelancers() {
      document
        .getElementById(
          "talent"
        )
        .scrollIntoView({
          behavior: "smooth"
        });
    }
    /* =========================================================
       PROJECTS
    ========================================================= */
    async function loadMyApplications(
      projectIds
    ) {
      myApplicationMap =
        new Map();
      if (
        !currentUser ||
        !currentProfile ||
        currentProfile.role !== "freelancer"
      ) {
        return;
      }
      if (
        !projectIds ||
        !projectIds.length
      ) {
        return;
      }
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("applications")
            .select(
              "id, project_id, freelancer_id, status, created_at"
            )
            .eq(
              "freelancer_id",
              currentUser.id
            )
            .in(
              "project_id",
              projectIds
            );
        if (error) {
          console.error(
            "Loading applications error:",
            error
          );
          return;
        }
        (data || []).forEach(
          function (application) {
            myApplicationMap.set(
              application.project_id,
              application
            );
          }
        );
      } catch (error) {
        console.error(
          "Loading applications exception:",
          error
        );
      }
    }
    async function loadProjects() {
      const container =
        document.getElementById(
          "projectList"
        );
      if (!container) {
        return;
      }
      container.innerHTML =
        '<div class="empty-message">Loading projects...</div>';
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("projects")
            .select(
              "id, client_id, title, description, budget, status, created_at"
            )
            .eq(
              "status",
              "open"
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            );
        if (error) {
          throw error;
        }
        allProjects =
          data || [];
        const projectIds =
          allProjects.map(
            function (project) {
              return project.id;
            }
          );
        await loadMyApplications(
          projectIds
        );
        renderProjectFilters();
        updateCategoryCounts();
        await renderProjects(
          getVisibleProjects()
        );
        updateHeroStats();
      } catch (error) {
        console.error(
          "Loading projects error:",
          error
        );
        container.innerHTML =
          '<div class="empty-message">' +
          'Could not load projects.' +
          '</div>';
      }
    }
    async function renderProjects(
      projects
    ) {
      const container =
        document.getElementById(
          "projectList"
        );
      if (!container) {
        return;
      }
      if (!projects.length) {
        container.innerHTML =
          '<div class="empty-message">' +
          (projectCategory !== "all" || projectQuery
            ? "No projects in this category yet. Try another category."
            : "No open projects found.") +
          '</div>';
        return;
      }
      const clientIds =
        Array.from(
          new Set(
            projects
              .map(
                function (project) {
                  return project.client_id;
                }
              )
              .filter(Boolean)
          )
        );
      let profileMap =
        new Map();
      if (clientIds.length) {
        const {
          data: profiles,
          error: profilesError
        } =
          await supabaseClient
            .from("profiles")
            .select(
              "id, name"
            )
            .in(
              "id",
              clientIds
            );
        if (profilesError) {
          throw profilesError;
        }
        (profiles || []).forEach(
          function (profile) {
            profileMap.set(
              profile.id,
              profile
            );
          }
        );
      }
      container.innerHTML = "";
      projects.forEach(
        function (project) {
          const card =
            document.createElement(
              "div"
            );
          card.className =
            "project-card";
          const title =
            project.title ||
            "Untitled Project";
          const description =
            project.description ||
            "No description provided.";
          const client =
            profileMap.get(
              project.client_id
            );
          const clientName =
            client && client.name
              ? client.name
              : "Unknown Client";
          const budget =
            project.budget !== null &&
            project.budget !== undefined &&
            project.budget !== ""
              ? project.budget
              : "Not specified";
          const isOwnProject =
            currentUser &&
            project.client_id ===
              currentUser.id;
          const application =
            myApplicationMap.get(
              project.id
            );
          let applicationHTML = "";
          let actionHTML = "";
          if (!currentUser) {
            actionHTML = `
              <button
                type="button"
                class="btn btn-primary"
                onclick="openAuth('login')"
              >
                Log In to Apply
              </button>
            `;
          } else if (
            currentProfile &&
            currentProfile.role === "freelancer"
          ) {
            if (isOwnProject) {
              applicationHTML = `
                <span class="own-project-badge">
                  Your Project
                </span>
              `;
              actionHTML = `
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="openProjectDetails('${escapeJS(project.id)}')"
                >
                  Open Project
                </button>
              `;
            } else if (application) {
              applicationHTML = `
                <span class="application-badge">
                  Already Applied
                </span>
              `;
              actionHTML = `
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="openProjectDetails('${escapeJS(project.id)}')"
                >
                  View Application
                </button>
              `;
            } else {
              actionHTML = `
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="openProjectDetails('${escapeJS(project.id)}')"
                >
                  Open Project
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="applyToProject('${escapeJS(project.id)}')"
                >
                  Apply Now
                </button>
              `;
            }
          } else if (
            currentProfile &&
            currentProfile.role === "client"
          ) {
            if (isOwnProject) {
              applicationHTML = `
                <span class="own-project-badge">
                  Your Project
                </span>
              `;
              actionHTML = `
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="openProjectDetails('${escapeJS(project.id)}')"
                >
                  Open Project
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="openApplicants('${escapeJS(project.id)}')"
                >
                  Applicants
                </button>
              `;
            } else {
              actionHTML = `
                <button
                  type="button"
                  class="btn btn-secondary"
                  onclick="openProjectDetails('${escapeJS(project.id)}')"
                >
                  Open Project
                </button>
              `;
            }
          } else {
            actionHTML = `
              <button
                type="button"
                class="btn btn-secondary"
                onclick="openProjectDetails('${escapeJS(project.id)}')"
              >
                Open Project
              </button>
            `;
          }
          const status =
            (project.status || "open").toLowerCase();
          const statusLabel =
            status === "in_progress"
              ? "In progress"
              : status === "closed"
                ? "Closed"
                : "Open";
          card.innerHTML = `
            <h3 data-no-i18n>
              ${escapeHTML(title)}
            </h3>
            <div class="project-description" data-no-i18n>${escapeHTML(description.trim())}</div>
            <div class="project-budget">
              Budget: ${escapeHTML(formatBudget(project.budget))}
            </div>
            <div class="project-client">
              Posted by: ${escapeHTML(clientName)}
            </div>
            <span class="project-status status-${escapeHTML(status)}">
              ${escapeHTML(statusLabel)}
            </span>
            ${applicationHTML}
            <div class="project-actions">
              ${actionHTML}
            </div>
          `;
          container.appendChild(
            card
          );
        }
      );
    }
    async function openProjectDetails(
      projectId
    ) {
      const project =
        allProjects.find(
          function (item) {
            return item.id === projectId;
          }
        );
      if (!project) {
        alert(
          "Project could not be found."
        );
        return;
      }
      currentProjectDetail =
        project;
      const container =
        document.getElementById(
          "projectDetailContent"
        );
      if (!container) {
        return;
      }
      const clientProfile =
        await getProjectClientProfile(
          project.client_id
        );
      const clientName =
        clientProfile &&
        clientProfile.name
          ? clientProfile.name
          : "Unknown Client";
      const budget =
        project.budget !== null &&
        project.budget !== undefined &&
        project.budget !== ""
          ? project.budget
          : "Not specified";
      const isOwnProject =
        currentUser &&
        project.client_id ===
          currentUser.id;
      let application = null;
      if (
        currentUser &&
        currentProfile &&
        currentProfile.role === "freelancer" &&
        !isOwnProject
      ) {
        application =
          await getMyApplication(
            project.id
          );
        if (application) {
          myApplicationMap.set(
            project.id,
            application
          );
        }
      }
      let actionHTML = "";
      if (!currentUser) {
        actionHTML = `
          <button
            type="button"
            class="btn btn-primary"
            onclick="openAuth('login')"
          >
            Log In to Apply
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            onclick="closeModal('projectDetailModal')"
          >
            Close
          </button>
        `;
      } else if (
        currentProfile &&
        currentProfile.role === "freelancer"
      ) {
        if (isOwnProject) {
          actionHTML = `
            <button
              type="button"
              class="btn btn-secondary"
              onclick="closeModal('projectDetailModal')"
            >
              Close
            </button>
          `;
        } else if (application) {
          actionHTML = `
            <button
              type="button"
              class="btn btn-secondary"
              disabled
            >
              Already Applied
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick="closeModal('projectDetailModal')"
            >
              Close
            </button>
          `;
        } else {
          actionHTML = `
            <button
              type="button"
              id="detailApplyButton"
              class="btn btn-primary"
              onclick="applyToProject('${escapeJS(project.id)}', true)"
            >
              Apply Now
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onclick="closeModal('projectDetailModal')"
            >
              Close
            </button>
          `;
        }
      } else {
        actionHTML = `
          <button
            type="button"
            class="btn btn-secondary"
            onclick="closeModal('projectDetailModal')"
          >
            Close
          </button>
        `;
      }
      if (isOwnProject) {
        actionHTML =
          `
          <button
            type="button"
            class="btn btn-primary"
            onclick="openApplicants('${escapeJS(project.id)}')"
          >
            Manage Applicants
          </button>
        ` + actionHTML;
      }
      const detailStatus =
        (project.status || "open").toLowerCase();
      const detailStatusLabel =
        detailStatus === "in_progress"
          ? "In progress"
          : detailStatus === "closed"
            ? "Closed"
            : "Open";
      container.innerHTML = `
        <div class="detail-header">
          <h2 class="project-detail-title" data-no-i18n>
            ${escapeHTML(project.title || "Untitled Project")}
          </h2>
          <div class="project-detail-meta">
            Posted by: ${escapeHTML(clientName)}
          </div>
        </div>
        <div class="project-detail-status status-${escapeHTML(detailStatus)}">
          ${escapeHTML(detailStatusLabel)}
        </div>
        <div class="project-detail-budget">
          Budget: ${escapeHTML(formatBudget(project.budget))}
        </div>
        <div class="detail-section">
          <h4>
            Project Description
          </h4>
          <p class="project-detail-description" ${project.description ? "data-no-i18n" : ""}>${escapeHTML(
            String(project.description || "No description provided.").trim()
          )}</p>
        </div>
        <div
          id="projectApplicationStatus"
          class="application-result"
        ></div>
        <div class="modal-actions">
          ${actionHTML}
        </div>
      `;
      document.getElementById(
        "projectDetailModal"
      ).style.display = "flex";
    }
    async function getProjectClientProfile(
      clientId
    ) {
      if (!clientId) {
        return null;
      }
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("profiles")
            .select(
              "id, name, role"
            )
            .eq(
              "id",
              clientId
            )
            .maybeSingle();
        if (error) {
          console.error(
            "Project client profile error:",
            error
          );
          return null;
        }
        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    async function getMyApplication(
      projectId
    ) {
      if (
        !currentUser ||
        !projectId
      ) {
        return null;
      }
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("applications")
            .select(
              "id, project_id, freelancer_id, status, created_at"
            )
            .eq(
              "project_id",
              projectId
            )
            .eq(
              "freelancer_id",
              currentUser.id
            )
            .maybeSingle();
        if (error) {
          console.error(
            "Application check error:",
            error
          );
          return null;
        }
        return data;
      } catch (error) {
        console.error(
          "Application check exception:",
          error
        );
        return null;
      }
    }
    async function applyToProject(
      projectId,
      fromDetail
    ) {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (
        !currentProfile ||
        currentProfile.role !== "freelancer"
      ) {
        alert(
          "Only freelancers can apply to projects."
        );
        return;
      }
      if (!requireMembership()) {
        return;
      }
      const project =
        allProjects.find(
          function (item) {
            return item.id === projectId;
          }
        );
      if (!project) {
        alert(
          "Project could not be found."
        );
        return;
      }
      if (
        project.client_id ===
        currentUser.id
      ) {
        alert(
          "You cannot apply to your own project."
        );
        return;
      }
      let existingApplication =
        myApplicationMap.get(
          projectId
        );
      if (!existingApplication) {
        existingApplication =
          await getMyApplication(
            projectId
          );
      }
      if (existingApplication) {
        myApplicationMap.set(
          projectId,
          existingApplication
        );
        if (fromDetail) {
          const statusElement =
            document.getElementById(
              "projectApplicationStatus"
            );
          if (statusElement) {
            statusElement.style.color =
              "#92400e";
            statusElement.textContent =
              "You have already applied to this project.";
          }
        } else {
          alert(
            "You have already applied to this project."
          );
          await loadProjects();
        }
        return;
      }
      let applyButton = null;
      if (fromDetail) {
        applyButton =
          document.getElementById(
            "detailApplyButton"
          );
      }
      if (applyButton) {
        applyButton.disabled = true;
        applyButton.textContent =
          "Applying...";
      }
      const statusElement =
        document.getElementById(
          "projectApplicationStatus"
        );
      if (statusElement) {
        statusElement.style.color =
          "#2563eb";
        statusElement.textContent =
          "Submitting your application...";
      }
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("applications")
            .insert({
              project_id:
                projectId,
              freelancer_id:
                currentUser.id,
              status:
                "pending"
            })
            .select(
              "id, project_id, freelancer_id, status, created_at"
            )
            .single();
        if (error) {
          throw error;
        }
        if (data) {
          myApplicationMap.set(
            projectId,
            data
          );
        }
        if (statusElement) {
          statusElement.style.color =
            "#16a34a";
          statusElement.textContent =
            "Application submitted successfully.";
        }
        if (fromDetail) {
          setTimeout(
            async function () {
              closeModal(
                "projectDetailModal"
              );
              await loadProjects();
            },
            900
          );
        } else {
          await loadProjects();
        }
      } catch (error) {
        console.error(
          "Apply to project error:",
          error
        );
        if (statusElement) {
          statusElement.style.color =
            "#dc2626";
          statusElement.textContent =
            error.message ||
            "Could not submit application.";
        } else {
          alert(
            error.message ||
            "Could not submit application."
          );
        }
        if (applyButton) {
          applyButton.disabled = false;
          applyButton.textContent =
            "Apply Now";
        }
      }
    }
    function openProjectModal() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (
        !currentProfile ||
        currentProfile.role !== "client"
      ) {
        alert(
          "Only clients can post projects."
        );
        return;
      }
      if (!requireMembership()) {
        return;
      }
      document.getElementById(
        "projectTitle"
      ).value = "";
      document.getElementById(
        "projectDescription"
      ).value = "";
      document.getElementById(
        "projectBudget"
      ).value = "";
      document.getElementById(
        "projectStatus"
      ).textContent = "";
      editingProjectId = null;
      const modalTitle =
        document.getElementById(
          "projectModalTitle"
        );
      if (modalTitle) {
        modalTitle.textContent =
          "Post a Project";
      }
      const saveButton =
        document.getElementById(
          "saveProjectButton"
        );
      if (saveButton) {
        saveButton.textContent =
          "Post Project";
      }
      document.getElementById(
        "projectModal"
      ).style.display = "flex";
    }
    async function createProject() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (
        !currentProfile ||
        currentProfile.role !== "client"
      ) {
        alert(
          "Only clients can post projects."
        );
        return;
      }
      if (!requireMembership()) {
        return;
      }
      const title =
        document.getElementById(
          "projectTitle"
        ).value.trim();
      const description =
        document.getElementById(
          "projectDescription"
        ).value.trim();
      const budgetInput =
        document.getElementById(
          "projectBudget"
        ).value.trim();
      const status =
        document.getElementById(
          "projectStatus"
        );
      const saveButton =
        document.getElementById(
          "saveProjectButton"
        );
      if (!title) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Please enter a project title.";
        return;
      }
      if (!description) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Please enter a project description.";
        return;
      }
      if (
        budgetInput === "" ||
        Number.isNaN(
          Number(budgetInput)
        ) ||
        Number(budgetInput) < 0
      ) {
        status.style.color =
          "#dc2626";
        status.textContent =
          "Please enter a valid budget.";
        return;
      }
      const budget =
        Number(budgetInput);
      const isEditing =
        Boolean(editingProjectId);
      status.style.color =
        "#2563eb";
      status.textContent =
        isEditing
          ? "Saving changes..."
          : "Posting project...";
      saveButton.disabled =
        true;
      try {
        const payload = {
          title:
            title,
          description:
            description,
          budget:
            budget
        };
        let query;
        if (isEditing) {
          query = supabaseClient
            .from("projects")
            .update(payload)
            .eq(
              "id",
              editingProjectId
            );
        } else {
          query = supabaseClient
            .from("projects")
            .insert({
              ...payload,
              client_id:
                currentUser.id,
              status:
                "open"
            });
        }
        const result =
          await query
            .select(
              "id, client_id, title, description, budget, status, created_at"
            )
            .maybeSingle();
        const data = requireChangedRow(
          result,
          isEditing
            ? "Could not update the project."
            : "Could not save project."
        );
        const existingIndex =
          allProjects.findIndex(
            function (project) {
              return project.id === data.id;
            }
          );
        if (existingIndex >= 0) {
          allProjects[existingIndex] = data;
        } else {
          allProjects = [
            data,
            ...allProjects
          ];
        }
        status.style.color =
          "#16a34a";
        status.textContent =
          isEditing
            ? "Project updated successfully."
            : "Project posted successfully.";
        await loadProjects();
        if (
          typeof refreshDashboard ===
          "function"
        ) {
          refreshDashboard();
        }
        setTimeout(
          function () {
            closeModal(
              "projectModal"
            );
            editingProjectId = null;
          },
          800
        );
      } catch (error) {
        console.error(
          "Create project error:",
          error
        );
        status.style.color =
          "#dc2626";
        status.textContent =
          error.message ||
          "Could not save project.";
      } finally {
        saveButton.disabled =
          false;
      }
    }
    /* =========================================================
       MESSAGES / UNREAD SYSTEM
    ========================================================= */
    function updateUnreadBadge(
      count
    ) {
      const badge =
        document.getElementById(
          "messageUnreadBadge"
        );
      if (!badge) {
        return;
      }
      const safeCount =
        Number(count) || 0;
      if (safeCount > 0) {
        badge.textContent =
          safeCount > 99
            ? "99+"
            : String(safeCount);
        badge.style.display =
          "inline-flex";
      } else {
        badge.textContent =
          "0";
        badge.style.display =
          "none";
      }
    }
    async function updateUnreadCount() {
      if (!currentUser) {
        updateUnreadBadge(0);
        return;
      }
      try {
        const {
          count,
          error
        } =
          await supabaseClient
            .from("messages")
            .select(
              "id",
              {
                count: "exact",
                head: true
              }
            )
            .eq(
              "receiver_id",
              currentUser.id
            )
            .eq(
              "is_read",
              false
            );
        if (error) {
          console.error(
            "Unread count error:",
            error
          );
          return;
        }
        updateUnreadBadge(
          count || 0
        );
      } catch (error) {
        console.error(
          "Unread count exception:",
          error
        );
      }
    }
    async function openMessages() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      const modal =
        document.getElementById(
          "messagesModal"
        );
      modal.style.display =
        "flex";
      await loadConversations();
    }
    async function loadConversations() {
      const container =
        document.getElementById(
          "conversationList"
        );
      if (!container) {
        return;
      }
      container.innerHTML =
        '<div class="messages-loading">Loading conversations...</div>';
      if (!currentUser) {
        container.innerHTML =
          '<div class="conversation-empty">Please log in to view your messages.</div>';
        return;
      }
      try {
        const {
          data: messages,
          error: messagesError
        } =
          await supabaseClient
            .from("messages")
            .select(
              "id, sender_id, receiver_id, message, created_at, is_read"
            )
            .or(
              "sender_id.eq." +
              currentUser.id +
              ",receiver_id.eq." +
              currentUser.id
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            );
        if (messagesError) {
          throw messagesError;
        }
        if (!messages || !messages.length) {
          container.innerHTML =
            '<div class="conversation-empty">' +
            'No conversations yet.' +
            '</div>';
          return;
        }
        const conversationMap =
          new Map();
        messages.forEach(
          function (message) {
            const otherUserId =
              message.sender_id ===
              currentUser.id
                ? message.receiver_id
                : message.sender_id;
            if (!otherUserId) {
              return;
            }
            if (!conversationMap.has(otherUserId)) {
              conversationMap.set(
                otherUserId,
                {
                  latestMessage: message,
                  unreadCount: 0
                }
              );
            }
            const conversation =
              conversationMap.get(
                otherUserId
              );
            if (
              message.receiver_id ===
                currentUser.id &&
              message.sender_id ===
                otherUserId &&
              message.is_read === false
            ) {
              conversation.unreadCount += 1;
            }
          }
        );
        const otherUserIds =
          Array.from(
            conversationMap.keys()
          );
        if (!otherUserIds.length) {
          container.innerHTML =
            '<div class="conversation-empty">' +
            'No conversations yet.' +
            '</div>';
          return;
        }
        const {
          data: profiles,
          error: profilesError
        } =
          await supabaseClient
            .from("profiles")
            .select(
              "id, name, role, bio, skills"
            )
            .in(
              "id",
              otherUserIds
            );
        if (profilesError) {
          throw profilesError;
        }
        const profileMap =
          new Map();
        (profiles || []).forEach(
          function (profile) {
            profileMap.set(
              profile.id,
              profile
            );
          }
        );
        container.innerHTML = "";
        otherUserIds.forEach(
          function (userId) {
            const conversation =
              conversationMap.get(
                userId
              );
            const profile =
              profileMap.get(
                userId
              );
            if (!profile) {
              return;
            }
            const name =
              profile.name ||
              "Unknown User";
            const latestMessage =
              conversation.latestMessage;
            const preview =
              latestMessage.message ||
              "";
            const time =
              formatConversationTime(
                latestMessage.created_at
              );
            const unread =
              conversation.unreadCount;
            const item =
              document.createElement(
                "div"
              );
            item.className =
              "conversation-item";
            const avatar =
              document.createElement(
                "div"
              );
            avatar.className =
              "conversation-avatar";
            avatar.textContent =
              name
                .charAt(0)
                .toUpperCase();
            const info =
              document.createElement(
                "div"
              );
            info.className =
              "conversation-info";
            const top =
              document.createElement(
                "div"
              );
            top.className =
              "conversation-top";
            const nameElement =
              document.createElement(
                "div"
              );
            nameElement.className =
              "conversation-name";
            nameElement.setAttribute(
              "data-no-i18n",
              ""
            );
            nameElement.textContent =
              name;
            const timeElement =
              document.createElement(
                "div"
              );
            timeElement.className =
              "conversation-time";
            timeElement.textContent =
              time;
            top.appendChild(
              nameElement
            );
            top.appendChild(
              timeElement
            );
            const previewElement =
              document.createElement(
                "div"
              );
            previewElement.className =
              "conversation-preview";
            previewElement.setAttribute(
              "data-no-i18n",
              ""
            );
            previewElement.textContent =
              preview;
            info.appendChild(
              top
            );
            info.appendChild(
              previewElement
            );
            item.appendChild(
              avatar
            );
            item.appendChild(
              info
            );
            if (unread > 0) {
              const unreadElement =
                document.createElement(
                  "div"
                );
              unreadElement.className =
                "conversation-unread";
              unreadElement.textContent =
                unread > 99
                  ? "99+"
                  : String(unread);
              item.appendChild(
                unreadElement
              );
            }
            item.addEventListener(
              "click",
              async function () {
                closeModal(
                  "messagesModal"
                );
                await openChat(
                  profile
                );
              }
            );
            container.appendChild(
              item
            );
          }
        );
        if (!container.children.length) {
          container.innerHTML =
            '<div class="conversation-empty">' +
            'No conversations found.' +
            '</div>';
        }
      } catch (error) {
        console.error(
          "Loading conversations error:",
          error
        );
        container.innerHTML =
          '<div class="conversation-empty">' +
          'Could not load conversations.' +
          '</div>';
      }
    }
    function formatConversationTime(
      dateString
    ) {
      if (!dateString) {
        return "";
      }
      const date =
        new Date(
          dateString
        );
      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }
      const now =
        new Date();
      const diff =
        now.getTime() -
        date.getTime();
      const minute =
        60 * 1000;
      const hour =
        60 * minute;
      const day =
        24 * hour;
      if (diff < minute) {
        return "now";
      }
      if (diff < hour) {
        return (
          Math.floor(
            diff / minute
          ) +
          "m"
        );
      }
      if (diff < day) {
        return (
          Math.floor(
            diff / hour
          ) +
          "h"
        );
      }
      if (diff < 7 * day) {
        return (
          Math.floor(
            diff / day
          ) +
          "d"
        );
      }
      return formatDate(dateString);
    }
    async function startMessageNotifications() {
      if (!currentUser) {
        return;
      }
      await closeMessageNotifications();
      try {
        messageNotificationChannel =
          supabaseClient
            .channel(
              "meejob-message-notifications-" +
              currentUser.id +
              "-" +
              Date.now()
            )
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "messages"
              },
              async function (payload) {
                const message =
                  payload.new;
                if (!message) {
                  return;
                }
                if (
                  message.receiver_id !==
                  currentUser.id
                ) {
                  return;
                }
                if (
                  currentChatUser &&
                  message.sender_id ===
                  currentChatUser.id
                ) {
                  await markMessagesAsRead(
                    currentChatUser.id
                  );
                  await updateUnreadCount();
                  if (
                    document.getElementById(
                      "messagesModal"
                    ).style.display ===
                    "flex"
                  ) {
                    await loadConversations();
                  }
                  return;
                }
                await updateUnreadCount();
                if (
                  document.getElementById(
                    "messagesModal"
                  ).style.display ===
                  "flex"
                ) {
                  await loadConversations();
                }
              }
            )
            .subscribe(
              function (status) {
                console.log(
                  "Message notification channel:",
                  status
                );
              }
            );
      } catch (error) {
        console.error(
          "Message notification error:",
          error
        );
      }
    }
    async function closeMessageNotifications() {
      if (!messageNotificationChannel) {
        return;
      }
      try {
        await supabaseClient.removeChannel(
          messageNotificationChannel
        );
      } catch (error) {
        console.error(
          "Close message notification error:",
          error
        );
      }
      messageNotificationChannel =
        null;
    }
    async function markMessagesAsRead(
      otherUserId
    ) {
      if (
        !currentUser ||
        !otherUserId
      ) {
        return;
      }
      try {
        const {
          error
        } =
          await supabaseClient
            .from("messages")
            .update({
              is_read: true
            })
            .eq(
              "receiver_id",
              currentUser.id
            )
            .eq(
              "sender_id",
              otherUserId
            )
            .eq(
              "is_read",
              false
            );
        if (error) {
          console.error(
            "Mark messages as read error:",
            error
          );
          return;
        }
        await updateUnreadCount();
      } catch (error) {
        console.error(
          "Mark messages as read exception:",
          error
        );
      }
    }
    /* =========================
       CHAT
    ========================= */
    async function openChat(
      profile
    ) {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (!profile || !profile.id) {
        alert(
          "User profile could not be found."
        );
        return;
      }
      if (
        profile.id ===
        currentUser.id
      ) {
        alert(
          "You cannot message yourself."
        );
        return;
      }
      currentChatUser =
        profile;
      const chatName =
        document.getElementById(
          "chatUserName"
        );
      chatName.setAttribute(
        "data-no-i18n",
        ""
      );
      chatName.textContent =
        profile.name ||
        "User";
      document.getElementById(
        "chatUserRole"
      ).textContent =
        profile.role
          ? profile.role === "freelancer"
            ? "Freelancer"
            : "Client"
          : "MEEJOB Messages";
      document.getElementById(
        "chatModal"
      ).style.display =
        "flex";
      document.getElementById(
        "chatInput"
      ).value = "";
      renderedMessageIds =
        new Set();
      await removeChatChannel();
      await markMessagesAsRead(
        profile.id
      );
      await loadChatMessages();
      await subscribeToChat();
      setTimeout(
        function () {
          const input =
            document.getElementById(
              "chatInput"
            );
          if (input) {
            input.focus();
          }
        },
        100
      );
    }
    async function loadChatMessages() {
      const container =
        document.getElementById(
          "chatMessages"
        );
      if (!container) {
        return;
      }
      if (
        !currentUser ||
        !currentChatUser
      ) {
        return;
      }
      container.innerHTML =
        '<div class="chat-empty">Loading messages...</div>';
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("messages")
            .select(
              "id, sender_id, receiver_id, message, created_at, is_read"
            )
            .or(
              "and(sender_id.eq." +
              currentUser.id +
              ",receiver_id.eq." +
              currentChatUser.id +
              "),and(sender_id.eq." +
              currentChatUser.id +
              ",receiver_id.eq." +
              currentUser.id +
              ")"
            )
            .order(
              "created_at",
              {
                ascending: true
              }
            );
        if (error) {
          throw error;
        }
        container.innerHTML = "";
        renderedMessageIds =
          new Set();
        if (!data || !data.length) {
          container.innerHTML =
            '<div class="chat-empty">' +
            'No messages yet. Start the conversation!' +
            '</div>';
          return;
        }
        data.forEach(
          function (message) {
            appendChatMessage(
              message
            );
          }
        );
        scrollChatToBottom();
      } catch (error) {
        console.error(
          "Loading chat messages error:",
          error
        );
        container.innerHTML =
          '<div class="chat-empty">' +
          'Could not load messages.' +
          '</div>';
      }
    }
    async function subscribeToChat() {
      if (
        !currentUser ||
        !currentChatUser
      ) {
        return;
      }
      await removeChatChannel();
      const channelName =
        "meejob-chat-" +
        currentUser.id +
        "-" +
        currentChatUser.id;
      currentChatChannel =
        supabaseClient
          .channel(
            channelName
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages"
            },
            async function (payload) {
              const message =
                payload.new;
              if (!message) {
                return;
              }
              const belongsToChat =
                (
                  message.sender_id ===
                    currentUser.id &&
                  message.receiver_id ===
                    currentChatUser.id
                )
                ||
                (
                  message.sender_id ===
                    currentChatUser.id &&
                  message.receiver_id ===
                    currentUser.id
                );
              if (!belongsToChat) {
                return;
              }
              appendChatMessage(
                message
              );
              if (
                message.receiver_id ===
                currentUser.id
              ) {
                await markMessagesAsRead(
                  currentChatUser.id
                );
              }
              scrollChatToBottom();
            }
          )
          .subscribe(
            function (status) {
              console.log(
                "Chat realtime status:",
                status
              );
            }
          );
    }
    async function removeChatChannel() {
      if (!currentChatChannel) {
        return;
      }
      try {
        await supabaseClient.removeChannel(
          currentChatChannel
        );
      } catch (error) {
        console.error(
          "Remove chat channel error:",
          error
        );
      }
      currentChatChannel =
        null;
    }
    function appendChatMessage(
      message
    ) {
      if (!message || !message.id) {
        return;
      }
      if (
        renderedMessageIds.has(
          message.id
        )
      ) {
        return;
      }
      renderedMessageIds.add(
        message.id
      );
      const container =
        document.getElementById(
          "chatMessages"
        );
      if (!container) {
        return;
      }
      const empty =
        container.querySelector(
          ".chat-empty"
        );
      if (empty) {
        empty.remove();
      }
      const isMine =
        message.sender_id ===
        currentUser.id;
      const wrapper =
        document.createElement(
          "div"
        );
      wrapper.className =
        "chat-message " +
        (
          isMine
            ? "mine"
            : "theirs"
        );
      const bubble =
        document.createElement(
          "div"
        );
      bubble.className =
        "message-bubble";
      const messageText =
        document.createElement(
          "div"
        );
      messageText.setAttribute(
        "data-no-i18n",
        ""
      );
      messageText.textContent =
        message.message || "";
      const time =
        document.createElement(
          "div"
        );
      time.className =
        "message-time";
      time.textContent =
        formatMessageTime(
          message.created_at
        );
      bubble.appendChild(
        messageText
      );
      bubble.appendChild(
        time
      );
      wrapper.appendChild(
        bubble
      );
      container.appendChild(
        wrapper
      );
    }
    function formatMessageTime(
      dateString
    ) {
      if (!dateString) {
        return "";
      }
      const date =
        new Date(
          dateString
        );
      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }
      return date.toLocaleTimeString(
        document.documentElement.lang === "lo" ? "lo-LA" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: document.documentElement.lang !== "lo"
        }
      );
    }
    async function sendMessage() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (!currentChatUser) {
        return;
      }
      if (
        currentChatUser.id ===
        currentUser.id
      ) {
        alert(
          "You cannot message yourself."
        );
        return;
      }
      if (!requireMembership()) {
        return;
      }
      const input =
        document.getElementById(
          "chatInput"
        );
      const button =
        document.getElementById(
          "sendMessageBtn"
        );
      const messageText =
        input.value.trim();
      if (!messageText) {
        return;
      }
      button.disabled =
        true;
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("messages")
            .insert({
              sender_id:
                currentUser.id,
              receiver_id:
                currentChatUser.id,
              message:
                messageText,
              is_read:
                false
            })
            .select(
              "id, sender_id, receiver_id, message, created_at, is_read"
            )
            .single();
        if (error) {
          throw error;
        }
        input.value = "";
        if (data) {
          appendChatMessage(
            data
          );
          scrollChatToBottom();
        }
        if (
          document.getElementById(
            "messagesModal"
          ).style.display ===
          "flex"
        ) {
          await loadConversations();
        }
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );
        alert(
          error.message ||
          "Could not send message."
        );
      } finally {
        button.disabled =
          false;
        input.focus();
      }
    }
    function handleChatKeydown(
      event
    ) {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    }
    function scrollChatToBottom() {
      const container =
        document.getElementById(
          "chatMessages"
        );
      if (!container) {
        return;
      }
      setTimeout(
        function () {
          container.scrollTop =
            container.scrollHeight;
        },
        50
      );
    }
    async function closeChat() {
      await removeChatChannel();
      currentChatUser =
        null;
      renderedMessageIds =
        new Set();
      closeModal(
        "chatModal"
      );
    }
    /* =========================
       GENERAL MODAL FUNCTIONS
    ========================= */
    function closeModal(
      id
    ) {
      const modal =
        document.getElementById(
          id
        );
      if (!modal) {
        return;
      }
      modal.style.display =
        "none";
    }
    document.addEventListener(
      "click",
      function (event) {
        if (
          event.target.classList &&
          event.target.classList.contains(
            "modal"
          )
        ) {
          const id =
            event.target.id;
          if (id === "chatModal") {
            closeChat();
          } else {
            closeModal(id);
          }
        }
      }
    );
    /* =========================
       SECURITY HELPERS
    ========================= */
    function escapeHTML(
      value
    ) {
      return String(
        value == null
          ? ""
          : value
      )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    function escapeJS(
      value
    ) {
      return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/</g, "\\u003C")
        .replace(/>/g, "\\u003E")
        .replace(/&/g, "\\u0026")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
    }

    /* ==========================================================================
       DATA NORMALIZATION
       Profiles in the database may contain stray whitespace. Trim on read so
       role checks and cards always behave consistently.
    ========================================================================== */

    function safeProfileLink(value) {
      const raw = String(value || "").trim();
      if (!raw) {
        return "";
      }
      let url = raw;
      if (!/^https?:\/\//i.test(url)) {
        if (/^(www\.)?facebook\.com\//i.test(url)) {
          url = "https://" + url;
        } else {
          return "";
        }
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          return parsed.href;
        }
      } catch (error) {
        return "";
      }
      return "";
    }

    function normalizeProfile(profile) {
      if (!profile) {
        return profile;
      }
      return {
        ...profile,
        name: String(profile.name || "").trim(),
        role: String(profile.role || "").trim().toLowerCase(),
        bio: String(profile.bio || "").trim(),
        skills: String(profile.skills || "").trim(),
        rate: String(profile.rate || "").trim(),
        phone: String(profile.phone || "").trim(),
        facebook: String(profile.facebook || "").trim(),
        portfolio: String(profile.portfolio || "").trim()
      };
    }

    function openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.style.display = "flex";
      }
    }

    function openChatFromButton(button) {
      if (!button) {
        return;
      }
      openChat({
        id: button.getAttribute("data-profile-id"),
        name: button.getAttribute("data-profile-name") || "User",
        role: button.getAttribute("data-profile-role") || "client"
      });
    }

    function formatBudget(value) {
      if (value === null || value === undefined || value === "") {
        return "Not specified";
      }
      const number = Number(value);
      if (Number.isNaN(number)) {
        return String(value);
      }
      return "$" + number.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }

    function formatDate(value) {
      if (!value) {
        return "";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      if (document.documentElement.lang === "lo") {
        const laoMonths = [
          "ມ.ກ.", "ກ.ພ.", "ມ.ນ.", "ມ.ສ.", "ພ.ພ.", "ມິ.ຖ.",
          "ກ.ລ.", "ສ.ຫ.", "ກ.ຍ.", "ຕ.ລ.", "ພ.ຈ.", "ທ.ວ."
        ];
        return (
          date.getDate() +
          " " +
          laoMonths[date.getMonth()] +
          " " +
          date.getFullYear()
        );
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }

    function statusLabel(status) {
      const key = String(status || "open").toLowerCase();
      if (key === "in_progress" || key === "in-progress") {
        return "In progress";
      }
      if (key === "closed") {
        return "Closed";
      }
      if (key === "accepted") {
        return "Accepted";
      }
      if (key === "declined") {
        return "Declined";
      }
      if (key === "pending") {
        return "Pending";
      }
      if (key === "approved") {
        return "Approved";
      }
      if (key === "rejected") {
        return "Rejected";
      }
      return "Open";
    }

    function moderationLabel(status) {
      const key = String(status || "pending").toLowerCase();
      if (key === "approved") {
        return "Approved";
      }
      if (key === "rejected") {
        return "Rejected";
      }
      return "Pending approval";
    }

    /* ==========================================================================
       MOBILE MENU
    ========================================================================== */

    function toggleMobileMenu(force) {
      const menu = document.getElementById("mobileMenu");
      const button = document.getElementById("mobileMenuButton");
      if (!menu || !button) {
        return;
      }
      const shouldOpen =
        typeof force === "boolean"
          ? force
          : !menu.classList.contains("open");
      menu.classList.toggle("open", shouldOpen);
      button.setAttribute("aria-expanded", String(shouldOpen));
      button.textContent = shouldOpen ? "✕" : "☰";
    }

    document.addEventListener("click", function (event) {
      const menu = document.getElementById("mobileMenu");
      if (!menu || !menu.classList.contains("open")) {
        return;
      }
      if (menu.contains(event.target)) {
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest("#mobileMenuButton")
      ) {
        return;
      }
      toggleMobileMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        toggleMobileMenu(false);
      }
    });

    /* ==========================================================================
       HERO STATS
    ========================================================================== */

    function setText(id, value) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = String(value);
      }
    }

    function updateHeroStats() {
      setText("statJobs", allJobs.length);
      setText("statFreelancers", allFreelancers.length);
      setText("statProjects", allProjects.length);
    }

    /* ==========================================================================
       MEMBERSHIP — pricing, payment requests and status
    ========================================================================== */

    function updateMembershipNav() {
      const button = document.getElementById("membershipNavButton");
      if (!button) {
        return;
      }
      if (!currentUser) {
        button.style.display = "none";
        return;
      }
      button.style.display = "";
      const snapshot = membershipSnapshot();
      let label = "Membership";
      if (snapshot.state === "trial") {
        label = "Trial · " + snapshot.days + "d";
      } else if (snapshot.state === "member") {
        label = "Member";
      } else if (snapshot.state === "expired") {
        label = "Renew";
      }
      button.textContent = label;
      button.classList.toggle(
        "membership-nav-expired",
        snapshot.state === "expired"
      );
    }

    function membershipStatusMarkup(compact) {
      if (!membershipAvailable) {
        return `
          <div class="membership-state is-warning">
            <span class="membership-badge">Setup needed</span>
            <strong>Membership system is not set up yet.</strong>
            <p>Run supabase/membership.sql in the Supabase SQL editor to enable the free month and paid plans.</p>
          </div>
        `;
      }

      const snapshot = membershipSnapshot();

      if (snapshot.state === "admin") {
        return `
          <div class="membership-state is-admin">
            <span class="membership-badge">Administrator</span>
            <strong>No membership required</strong>
            <p>You can post, apply and message without a plan.</p>
          </div>
        `;
      }

      if (snapshot.state === "trial") {
        return `
          <div class="membership-state is-trial">
            <span class="membership-badge">Free trial</span>
            <strong>${snapshot.days} day${snapshot.days === 1 ? "" : "s"} left</strong>
            <p>Your free month ends on ${escapeHTML(formatDate(snapshot.until))}.</p>
            ${
              compact
                ? ""
                : '<p class="membership-small">Choose a plan any time. Your paid days start after the free month.</p>'
            }
          </div>
        `;
      }

      if (snapshot.state === "member") {
        return `
          <div class="membership-state is-active">
            <span class="membership-badge">Active member</span>
            <strong>${escapeHTML(membershipPlanLabel(snapshot.plan))} plan</strong>
            <p>Active until ${escapeHTML(formatDate(snapshot.until))} · ${snapshot.days} day${snapshot.days === 1 ? "" : "s"} left</p>
            ${
              compact
                ? ""
                : '<p class="membership-small">You can renew before this date — the new days are added after the current expiry.</p>'
            }
          </div>
        `;
      }

      return `
        <div class="membership-state is-expired">
          <span class="membership-badge">Membership expired</span>
          <strong>Your free month has ended.</strong>
          <p>Choose a plan to keep posting, applying and messaging.</p>
        </div>
      `;
    }

    function renderMembershipStatus() {
      const box = document.getElementById("membershipStatusCard");
      if (box) {
        box.innerHTML = membershipStatusMarkup(false);
      }
      const profileBox = document.getElementById("profileMembershipBox");
      if (profileBox) {
        profileBox.innerHTML = membershipStatusMarkup(true);
      }
      updateMembershipNav();
    }

    async function openMembership(plan) {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (plan && MEMBERSHIP_PLANS[plan]) {
        selectedMembershipPlan = plan;
      }
      await loadMembershipInfo();
      renderMembershipStatus();
      selectPaymentMethod(selectedPaymentMethod);
      selectQrCurrency(selectedQrCurrency);
      selectMembershipPlan(selectedMembershipPlan);
      setMembershipStatus("", "");
      const contactInput = document.getElementById("membershipContact");
      if (contactInput && !contactInput.value) {
        contactInput.value =
          (currentProfile && (currentProfile.phone || currentProfile.facebook)) ||
          "";
      }
      openModal("membershipModal");
      await renderMembershipHistory();
    }

    function selectMembershipPlan(plan) {
      if (!MEMBERSHIP_PLANS[plan]) {
        return;
      }
      selectedMembershipPlan = plan;
      document.querySelectorAll("[data-membership-plan]").forEach(function (card) {
        card.classList.toggle(
          "selected",
          card.getAttribute("data-membership-plan") === plan
        );
      });
      setText("membershipFormPlan", membershipPlanLabel(plan));
      updateMembershipAmounts();    }

    function paymentAmountFor(plan, currency) {
      const planInfo = MEMBERSHIP_PLANS[plan] || MEMBERSHIP_PLANS.monthly;
      const config = PAYMENT_CURRENCIES[currency] || PAYMENT_CURRENCIES.usd;
      if (currency === "usd") {
        return planInfo.amount;
      }
      const converted = planInfo.amount * config.rate;
      return Math.ceil(converted / config.step) * config.step;
    }

    function formatPaymentAmount(amount, currency) {
      if (currency === "usd") {
        return "$" + amount;
      }
      return (
        Number(amount).toLocaleString("en-US") +
        " " +
        (PAYMENT_CURRENCIES[currency] ? PAYMENT_CURRENCIES[currency].label : "")
      ).trim();
    }

    function updateMembershipAmounts() {
      const usd = MEMBERSHIP_PLANS[selectedMembershipPlan].amount;
      const currency = selectedQrCurrency;
      const amount = paymentAmountFor(selectedMembershipPlan, currency);

      setText("membershipFormAmount", "$" + usd);
      setText("membershipPayAmount", formatPaymentAmount(amount, currency));

      const alt = document.getElementById("membershipPayAmountAlt");
      if (alt) {
        alt.textContent =
          currency === "usd" ? "" : "(≈ $" + usd + " USD)";
      }

      const rateNote = document.getElementById("membershipQrRateNote");
      if (rateNote) {
        rateNote.hidden = currency === "usd";
      }
    }

    function selectQrCurrency(currency) {
      if (!PAYMENT_CURRENCIES[currency]) {
        return;
      }
      selectedQrCurrency = currency;

      document.querySelectorAll("[data-qr-currency]").forEach(function (button) {
        button.classList.toggle(
          "active",
          button.getAttribute("data-qr-currency") === currency
        );
      });

      const config = PAYMENT_CURRENCIES[currency];
      const image = document.getElementById("membershipQrImage");
      const fallback = document.getElementById("membershipQrFallback");
      if (image) {
        image.style.display = "";
        image.src = config.image;
        image.alt = "MEEJOB payment QR code — " + config.label;
      }
      if (fallback) {
        fallback.hidden = true;
      }

      const bankCurrency = document.getElementById("membershipQrBankCurrency");
      if (bankCurrency) {
        bankCurrency.textContent = config.label;
      }

      updateMembershipAmounts();
    }

    function handleQrError() {
      const image = document.getElementById("membershipQrImage");
      const fallback = document.getElementById("membershipQrFallback");
      if (image) {
        image.style.display = "none";
      }
      if (fallback) {
        fallback.hidden = false;
      }
    }

    function selectPaymentMethod(method) {
      if (method !== "qr" && method !== "facebook") {
        return;
      }
      selectedPaymentMethod = method;
      document.querySelectorAll("[data-payment-method]").forEach(function (button) {
        button.classList.toggle(
          "active",
          button.getAttribute("data-payment-method") === method
        );
      });
      const qrPanel = document.getElementById("membershipQrPanel");
      const fbPanel = document.getElementById("membershipFacebookPanel");
      if (qrPanel) {
        qrPanel.hidden = method !== "qr";
      }
      if (fbPanel) {
        fbPanel.hidden = method !== "facebook";
      }
    }

    function setMembershipStatus(message, color) {
      const status = document.getElementById("membershipFormStatus");
      if (!status) {
        return;
      }
      status.textContent = message || "";
      status.style.color = color || "";
    }

    async function renderMembershipHistory(containerId) {
      const container = document.getElementById(
        containerId || "membershipHistory"
      );
      if (!container) {
        return;
      }
      if (!currentUser) {
        container.innerHTML = "";
        return;
      }
      if (!membershipAvailable) {
        container.innerHTML =
          '<div class="empty-message">Membership requests need supabase/membership.sql to be enabled.</div>';
        return;
      }

      const { data, error } = await supabaseClient
        .from("membership_requests")
        .select(
          "id, plan, amount_usd, currency, method, status, admin_note, created_at, reviewed_at"
        )
        .eq("profile_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        container.innerHTML =
          '<div class="empty-message">Could not load your membership requests.</div>';
        return;
      }

      const requests = data || [];
      if (!requests.length) {
        container.innerHTML =
          '<div class="empty-message">No membership requests yet.</div>';
        return;
      }

      container.innerHTML = "";
      const list = document.createElement("div");
      list.className = "membership-history";

      requests.forEach(function (request) {
        const item = document.createElement("div");
        item.className = "membership-request";
        const status = String(request.status || "pending").toLowerCase();
        const method =
          request.method === "facebook" ? "Facebook page" : "QR transfer";
        const currency = String(request.currency || "USD").toUpperCase();
        const paidIn = currency === "USD" ? "" : " · paid in " + currency;
        item.innerHTML = `
          <div class="membership-request-main">
            <strong>${escapeHTML(membershipPlanLabel(request.plan))} · $${escapeHTML(request.amount_usd)}${escapeHTML(paidIn)}</strong>
            <span class="membership-request-meta">${escapeHTML(method)} · ${escapeHTML(formatDate(request.created_at))}</span>
            ${
              request.admin_note
                ? `<p class="membership-request-note">${escapeHTML(request.admin_note)}</p>`
                : ""
            }
          </div>
          <div class="membership-request-side">
            <span class="membership-status status-${escapeHTML(status)}">${escapeHTML(membershipStatusLabel(status))}</span>
            ${
              status === "pending"
                ? `<button type="button" class="btn btn-secondary btn-sm"
                     onclick="cancelMembershipRequest('${escapeJS(request.id)}')">Cancel</button>`
                : ""
            }
          </div>
        `;
        list.appendChild(item);
      });

      container.appendChild(list);
    }

    async function submitMembershipRequest() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (!membershipAvailable) {
        setMembershipStatus(
          "Membership requests need supabase/membership.sql to be enabled.",
          "#b45309"
        );
        return;
      }

      const contact = document
        .getElementById("membershipContact")
        .value.trim();
      const note = document
        .getElementById("membershipReference")
        .value.trim();
      const button = document.getElementById("membershipSubmitButton");

      if (!contact) {
        setMembershipStatus(
          "Please add a phone number or Facebook name so we can confirm your payment.",
          "#dc2626"
        );
        return;
      }

      setMembershipStatus("Sending request...", "#2563eb");
      if (button) {
        button.disabled = true;
      }

      try {
        const { error } = await supabaseClient
          .from("membership_requests")
          .insert({
            profile_id: currentUser.id,
            plan: selectedMembershipPlan,
            method: selectedPaymentMethod,
            currency: PAYMENT_CURRENCIES[selectedQrCurrency].code,
            contact: contact,
            note: note
          });

        if (error) {
          throw error;
        }

        setMembershipStatus(
          "Request sent. We will confirm your payment and activate your plan.",
          "#16a34a"
        );
        const reference = document.getElementById("membershipReference");
        if (reference) {
          reference.value = "";
        }
        await loadMembershipInfo();
        renderMembershipStatus();
        await renderMembershipHistory();
      } catch (error) {
        console.error("Membership request error:", error);
        setMembershipStatus(
          isSchemaMissing(error)
            ? "Membership requests need supabase/membership.sql to be enabled."
            : error.message || "Could not send the membership request.",
          "#dc2626"
        );
      } finally {
        if (button) {
          button.disabled = false;
        }
      }
    }

    async function cancelMembershipRequest(requestId) {
      if (!requestId || !confirm("Cancel this membership request?")) {
        return;
      }
      try {
        const { error } = await supabaseClient.rpc(
          "cancel_membership_request",
          { request_id: requestId }
        );
        if (error) {
          throw error;
        }
        setMembershipStatus("Request cancelled.", "#16a34a");
        await renderMembershipHistory();
        await renderMembershipHistory("dashboardMembershipHistory");
      } catch (error) {
        console.error("Cancel membership request error:", error);
        setMembershipStatus(
          error.message || "Could not cancel the membership request.",
          "#dc2626"
        );
      }
    }

    async function reviewMembershipRequest(requestId, decision) {
      if (!currentIsAdmin) {
        return;
      }
      const question =
        decision === "approved"
          ? "Approve this membership payment?"
          : "Reject this membership request?";
      if (!confirm(question)) {
        return;
      }
      try {
        const { error } = await supabaseClient.rpc(
          "review_membership_request",
          {
            request_id: requestId,
            decision: decision,
            review_note: ""
          }
        );
        if (error) {
          throw error;
        }
        alert(
          decision === "approved"
            ? "Membership activated."
            : "Membership request rejected."
        );
        await updateMembershipRequestsBadge();
        await refreshDashboard();
      } catch (error) {
        console.error("Review membership request error:", error);
        alert(error.message || "Could not review the membership request.");
      }
    }

    async function updateMembershipRequestsBadge() {
      const tab = document.getElementById("dashboardMembershipsTab");
      if (!tab || !currentIsAdmin) {
        return;
      }
      try {
        const { data, error } = await supabaseClient.rpc(
          "admin_list_membership_requests"
        );
        if (error) {
          return;
        }
        const pending = (data || []).filter(function (request) {
          return request.status === "pending";
        }).length;
        tab.textContent = pending
          ? "Membership requests (" + pending + ")"
          : "Membership requests";
      } catch (error) {
        /* the tab keeps its plain label */
      }
    }

    async function renderDashboardMembership(content) {
      content.innerHTML = `
        <div class="membership-dashboard-head">
          <div id="dashboardMembershipStatus">${membershipStatusMarkup(false)}</div>
          <button type="button" class="btn btn-primary" onclick="openMembership()">
            Choose a plan
          </button>
        </div>
        <h3 class="membership-history-title">Request history</h3>
        <div id="dashboardMembershipHistory" aria-live="polite">
          <div class="empty-message">Loading...</div>
        </div>
      `;
      await renderMembershipHistory("dashboardMembershipHistory");
    }

    async function renderDashboardMemberships(content) {
      if (!currentIsAdmin) {
        content.innerHTML =
          '<div class="empty-message">Only the site owner can review memberships.</div>';
        return;
      }

      const { data, error } = await supabaseClient.rpc(
        "admin_list_membership_requests"
      );
      if (error) {
        throw error;
      }

      const requests = data || [];
      const pending = requests.filter(function (request) {
        return request.status === "pending";
      });
      await updateMembershipRequestsBadge();

      if (!requests.length) {
        content.innerHTML =
          '<div class="empty-message">No membership requests yet.</div>';
        return;
      }

      const list = document.createElement("div");
      list.className = "membership-admin-list";

      requests.forEach(function (request) {
        const item = document.createElement("div");
        item.className = "membership-request membership-admin-request";
        const status = String(request.status || "pending").toLowerCase();
        const method =
          request.method === "facebook" ? "Facebook page" : "QR transfer";
        const currency = String(request.currency || "USD").toUpperCase();
        const currentAccess = request.membership_expires_at
          ? "Paid until " + formatDate(request.membership_expires_at)
          : request.trial_ends_at
            ? "Trial until " + formatDate(request.trial_ends_at)
            : "No active access";

        item.innerHTML = `
          <div class="membership-request-main">
            <strong>${escapeHTML(request.profile_name || "Member")}</strong>
            <span class="membership-request-meta">${escapeHTML(request.email || "")}</span>
            <span class="membership-request-meta">
              ${escapeHTML(membershipPlanLabel(request.plan))} · $${escapeHTML(request.amount_usd)} · ${escapeHTML(method)} · ${escapeHTML(currency)}
            </span>
            <span class="membership-request-meta">${escapeHTML(currentAccess)}</span>
            ${
              request.contact
                ? `<span class="membership-request-meta">Contact: ${escapeHTML(request.contact)}</span>`
                : ""
            }
            ${
              request.note
                ? `<p class="membership-request-note">${escapeHTML(request.note)}</p>`
                : ""
            }
            <span class="membership-request-meta">Requested ${escapeHTML(formatDate(request.created_at))}</span>
            ${
              request.admin_note
                ? `<p class="membership-request-note">Admin note: ${escapeHTML(request.admin_note)}</p>`
                : ""
            }
          </div>
          <div class="membership-request-side">
            <span class="membership-status status-${escapeHTML(status)}">${escapeHTML(membershipStatusLabel(status))}</span>
            ${
              status === "pending"
                ? `<button type="button" class="btn btn-primary btn-sm"
                     onclick="reviewMembershipRequest('${escapeJS(request.id)}', 'approved')">Approve</button>
                   <button type="button" class="btn btn-danger btn-sm"
                     onclick="reviewMembershipRequest('${escapeJS(request.id)}', 'rejected')">Reject</button>`
                : ""
            }
          </div>
        `;
        list.appendChild(item);
      });

      content.innerHTML = "";
      if (pending.length) {
        const note = document.createElement("p");
        note.className = "membership-admin-note";
        note.textContent =
          pending.length +
          " payment request" +
          (pending.length === 1 ? "" : "s") +
          " waiting for confirmation.";
        content.appendChild(note);
      }
      content.appendChild(list);
    }

    /* ==========================================================================
       DASHBOARD — posted projects and my applications
    ========================================================================== */

    async function openDashboard() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      await loadCurrentProfile();
      await loadAdminStatus();
      const isFreelancer =
        currentProfile && currentProfile.role === "freelancer";
      const isClient =
        currentProfile && currentProfile.role === "client";
      dashboardTab = currentIsAdmin
        ? "approvals"
        : isFreelancer
          ? "applications"
          : "projects";
      setText(
        "dashboardTitle",
        currentIsAdmin ? "Admin dashboard" : "Dashboard"
      );
      const newButton = document.getElementById("dashboardNewProjectButton");
      if (newButton) {
        newButton.style.display =
          isClient ? "inline-flex" : "none";
      }
      const projectsTab = document.querySelector('[data-dashboard-tab="projects"]');
      const applicationsTab = document.querySelector('[data-dashboard-tab="applications"]');
      const jobsTab = document.querySelector('[data-dashboard-tab="jobs"]');
      const approvalsTab = document.querySelector('[data-dashboard-tab="approvals"]');
      const membershipTab = document.querySelector('[data-dashboard-tab="membership"]');
      const membershipsTab = document.querySelector('[data-dashboard-tab="memberships"]');
      if (projectsTab) {
        projectsTab.style.display = isFreelancer ? "none" : "";
      }
      if (applicationsTab) {
        applicationsTab.style.display = isFreelancer ? "" : "none";
      }
      if (jobsTab) {
        jobsTab.style.display = isClient || currentIsAdmin ? "" : "none";
      }
      if (approvalsTab) {
        approvalsTab.style.display = currentIsAdmin ? "" : "none";
      }
      if (membershipTab) {
        membershipTab.style.display = "";
      }
      if (membershipsTab) {
        membershipsTab.style.display = currentIsAdmin ? "" : "none";
      }
      if (currentIsAdmin) {
        await updateMembershipRequestsBadge();
      }
      openModal("dashboardModal");
      updateDashboardTabs();
      await refreshDashboard();
    }

    function updateDashboardTabs() {
      document.querySelectorAll("[data-dashboard-tab]").forEach(function (tab) {
        tab.classList.toggle(
          "active",
          tab.getAttribute("data-dashboard-tab") === dashboardTab
        );
      });
    }

    function switchDashboardTab(tab) {
      if (
        tab !== "projects" &&
        tab !== "applications" &&
        tab !== "jobs" &&
        tab !== "approvals" &&
        tab !== "membership" &&
        tab !== "memberships"
      ) {
        return;
      }
      const isClient =
        currentProfile && currentProfile.role === "client";
      const isFreelancer =
        currentProfile && currentProfile.role === "freelancer";
      if (tab === "applications" && !isFreelancer) {
        return;
      }
      if (tab === "projects" && !isClient) {
        return;
      }
      if (tab === "jobs" && !isClient && !currentIsAdmin) {
        return;
      }
      if (tab === "approvals" && !currentIsAdmin) {
        return;
      }
      if (tab === "memberships" && !currentIsAdmin) {
        return;
      }
      if (tab === "membership" && !currentUser) {
        return;
      }
      dashboardTab = tab;
      updateDashboardTabs();
      refreshDashboard();
    }

    async function refreshDashboard() {
      const content = document.getElementById("dashboardContent");
      if (!content) {
        return;
      }
      content.innerHTML = '<div class="empty-message">Loading...</div>';
      try {
        if (dashboardTab === "applications") {
          await renderDashboardApplications(content);
        } else if (dashboardTab === "jobs") {
          await renderDashboardJobs(content);
        } else if (dashboardTab === "approvals") {
          await renderDashboardApprovals(content);
        } else if (dashboardTab === "membership") {
          await loadMembershipInfo();
          renderMembershipStatus();
          await renderDashboardMembership(content);
        } else if (dashboardTab === "memberships") {
          await renderDashboardMemberships(content);
        } else {
          await renderDashboardProjects(content);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        content.innerHTML =
          '<div class="empty-message">Could not load your dashboard.</div>';
      }
    }

    async function loadMyPostedProjects() {
      const { data, error } = await supabaseClient
        .from("projects")
        .select("id, client_id, title, description, budget, status, created_at")
        .eq("client_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      myProjectsCache = data || [];

      myProjectsCache.forEach(function (project) {
        const index = allProjects.findIndex(function (item) {
          return item.id === project.id;
        });
        if (index >= 0) {
          allProjects[index] = project;
        } else {
          allProjects.push(project);
        }
      });

      const counts = new Map();
      const ids = myProjectsCache.map(function (project) {
        return project.id;
      });

      if (ids.length) {
        const applications = await supabaseClient
          .from("applications")
          .select("id, project_id, freelancer_id, status, created_at")
          .in("project_id", ids);

        if (applications.error) {
          throw applications.error;
        }

        (applications.data || []).forEach(function (application) {
          const entry = counts.get(application.project_id) || {
            total: 0,
            pending: 0
          };
          entry.total += 1;
          if (application.status === "pending") {
            entry.pending += 1;
          }
          counts.set(application.project_id, entry);
        });
      }

      return {
        projects: myProjectsCache,
        counts: counts
      };
    }

    async function renderDashboardProjects(content) {
      const result = await loadMyPostedProjects();
      const projects = result.projects;

      if (!projects.length) {
        const canPostProject =
          currentProfile && currentProfile.role === "client";
        content.innerHTML = `
          <div class="empty-message">
            You have not posted a project yet.
            ${
              canPostProject
                ? `<div style="margin-top:16px;">
                    <button type="button" class="btn btn-primary" onclick="openProjectModal()">
                      Post your first project
                    </button>
                  </div>`
                : ""
            }
          </div>
        `;
        return;
      }

      const list = document.createElement("div");
      list.className = "dash-list";

      projects.forEach(function (project) {
        const stats = result.counts.get(project.id) || {
          total: 0,
          pending: 0
        };
        const status = String(project.status || "open").toLowerCase();
        const item = document.createElement("div");
        item.className = "dash-item";

        item.innerHTML = `
          <div class="dash-main">
            <div class="dash-title" data-no-i18n>${escapeHTML(project.title || "Untitled Project")}</div>
            <div class="dash-meta">
              <span class="project-status status-${escapeHTML(status)}">
                ${escapeHTML(statusLabel(status))}
              </span>
              <span>${escapeHTML(formatBudget(project.budget))}</span>
              <span>Posted ${escapeHTML(formatDate(project.created_at))}</span>
            </div>
          </div>
          <div class="dash-actions">
            <span class="count-chip${stats.pending ? "" : " neutral"}">
              ${stats.total} applicant${stats.total === 1 ? "" : "s"}${stats.pending ? " · " + stats.pending + " new" : ""}
            </span>
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="openApplicants('${escapeJS(project.id)}')">
              Applicants
            </button>
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="openEditProject('${escapeJS(project.id)}')">
              Edit
            </button>
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="setProjectStatus('${escapeJS(project.id)}', '${status === "closed" ? "open" : "closed"}')">
              ${status === "closed" ? "Reopen" : "Close"}
            </button>
            <button type="button" class="btn btn-danger btn-sm"
              onclick="deleteProject('${escapeJS(project.id)}')">
              Delete
            </button>
          </div>
        `;

        list.appendChild(item);
      });

      content.innerHTML = "";
      content.appendChild(list);
    }

    async function renderDashboardApplications(content) {
      const { data, error } = await supabaseClient
        .from("applications")
        .select("id, project_id, freelancer_id, status, created_at")
        .eq("freelancer_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const applications = data || [];

      if (!applications.length) {
        content.innerHTML = `
          <div class="empty-message">
            You have not applied to any project yet.
            <div style="margin-top:16px;">
              <button type="button" class="btn btn-primary" onclick="closeModal('dashboardModal'); scrollToProjects();">
                Browse projects
              </button>
            </div>
          </div>
        `;
        return;
      }

      const projectIds = Array.from(
        new Set(
          applications.map(function (application) {
            return application.project_id;
          })
        )
      );

      const projectsResult = await supabaseClient
        .from("projects")
        .select("id, client_id, title, status, budget")
        .in("id", projectIds);

      if (projectsResult.error) {
        throw projectsResult.error;
      }

      const projectMap = new Map();
      (projectsResult.data || []).forEach(function (project) {
        projectMap.set(project.id, project);

        const index = allProjects.findIndex(function (item) {
          return item.id === project.id;
        });
        if (index >= 0) {
          allProjects[index] = Object.assign({}, allProjects[index], project);
        } else {
          allProjects.push(project);
        }
      });

      const clientIds = Array.from(
        new Set(
          (projectsResult.data || [])
            .map(function (project) {
              return project.client_id;
            })
            .filter(Boolean)
        )
      );
      const clientMap = new Map();
      if (clientIds.length) {
        const clientProfiles = await supabaseClient
          .from("profiles")
          .select("id, name")
          .in("id", clientIds);
        if (!clientProfiles.error) {
          (clientProfiles.data || []).forEach(function (profile) {
            clientMap.set(profile.id, profile.name || "Client");
          });
        }
      }

      const list = document.createElement("div");
      list.className = "dash-list";

      applications.forEach(function (application) {
        const project = projectMap.get(application.project_id) || {};
        const item = document.createElement("div");
        item.className = "dash-item";

        item.innerHTML = `
          <div class="dash-main">
            <div class="dash-title" data-no-i18n>${escapeHTML(project.title || "Project unavailable")}</div>
            <div class="dash-meta">
              <span class="applicant-status ${escapeHTML(application.status || "pending")}">
                ${escapeHTML(statusLabel(application.status))}
              </span>
              <span>Applied ${escapeHTML(formatDate(application.created_at))}</span>
              <span>${escapeHTML(formatBudget(project.budget))}</span>
            </div>
          </div>
          <div class="dash-actions">
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="openProjectDetails('${escapeJS(application.project_id)}')">
              View project
            </button>
            ${
              project.client_id
                ? `<button type="button" class="btn btn-secondary btn-sm"
                    data-profile-id="${escapeHTML(project.client_id)}"
                    data-profile-name="${escapeHTML(clientMap.get(project.client_id) || "Client")}"
                    data-profile-role="client"
                    onclick="openChatFromButton(this)">
                    Message client
                  </button>`
                : ""
            }
          </div>
        `;

        list.appendChild(item);
      });

      content.innerHTML = "";
      content.appendChild(list);
    }

    async function renderDashboardJobs(content) {
      const { data, error } = await supabaseClient
        .from("jobs")
        .select("id, title, company, location, description, salary, contact, job_type, category, status, moderation_status, moderation_note, created_at")
        .eq("employer_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const jobs = data || [];
      myJobsCache = jobs;

      if (!jobs.length) {
        content.innerHTML = `
          <div class="empty-message">
            You have not posted a job yet.
            <div style="margin-top:16px;">
              <button type="button" class="btn btn-primary" onclick="closeModal('dashboardModal'); openJobModal();">
                Post a job
              </button>
            </div>
          </div>
        `;
        return;
      }

      const list = document.createElement("div");
      list.className = "dash-list";

      jobs.forEach(function (job) {
        const moderation = String(job.moderation_status || "pending").toLowerCase();
        const note = job.moderation_note
          ? `<div class="approval-note" data-no-i18n>${escapeHTML(job.moderation_note)}</div>`
          : "";
        const item = document.createElement("div");
        item.className = "dash-item";

        const displayTitle =
          job.title ||
          (window.meejobT ? window.meejobT("Untitled Job") : "Untitled Job");
        item.innerHTML = `
          <div class="dash-main">
            <div class="dash-title" data-no-i18n>${escapeHTML(displayTitle)}</div>
            <div class="dash-meta">
              <span class="project-status status-${escapeHTML(moderation)}">
                ${escapeHTML(moderationLabel(moderation))}
              </span>
              ${job.company ? `<span data-no-i18n>${escapeHTML(job.company)}</span>` : ""}
              ${job.location ? `<span data-no-i18n>${escapeHTML(job.location)}</span>` : ""}
              <span>Posted ${escapeHTML(formatDate(job.created_at))}</span>
            </div>
            ${note}
          </div>
          <div class="dash-actions">
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="openPosterStudio('${escapeJS(job.id)}')">
              Poster
            </button>
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="openEditJob('${escapeJS(job.id)}')">
              Edit
            </button>
            <button type="button" class="btn btn-danger btn-sm"
              onclick="deleteJob('${escapeJS(job.id)}')">
              Delete
            </button>
          </div>
        `;

        list.appendChild(item);
      });

      content.innerHTML = "";
      content.appendChild(list);
    }

    async function renderDashboardApprovals(content) {
      if (!currentIsAdmin) {
        content.innerHTML =
          '<div class="empty-message">Only the site owner can review jobs.</div>';
        return;
      }

      const { data, error } = await supabaseClient
        .from("jobs")
        .select("id, title, company, location, description, salary, contact, employer_id, created_at, moderation_status")
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      const jobs = data || [];
      const approvalsTab = document.getElementById("dashboardApprovalsTab");
      if (approvalsTab) {
        approvalsTab.textContent = jobs.length
          ? "Job approvals (" + jobs.length + ")"
          : "Job approvals";
      }

      if (!jobs.length) {
        content.innerHTML =
          '<div class="empty-message">No jobs waiting for approval.</div>';
        return;
      }

      const employerIds = Array.from(
        new Set(
          jobs
            .map(function (job) { return job.employer_id; })
            .filter(Boolean)
        )
      );
      const employerMap = new Map();
      if (employerIds.length) {
        const profilesResult = await supabaseClient
          .from("profiles")
          .select("id, name")
          .in("id", employerIds);
        if (!profilesResult.error) {
          (profilesResult.data || []).forEach(function (profile) {
            employerMap.set(profile.id, profile.name || "Unknown User");
          });
        }
      }

      const list = document.createElement("div");
      list.className = "dash-list";

      jobs.forEach(function (job) {
        const employerName =
          employerMap.get(job.employer_id) ||
          (window.meejobT ? window.meejobT("Unknown User") : "Unknown User");
        const description = String(job.description || "");
        const shortDescription =
          description.length > 700
            ? description.slice(0, 700) + "…"
            : description;
        const displayDescription =
          shortDescription ||
          (window.meejobT
            ? window.meejobT("No description provided.")
            : "No description provided.");
        const displayTitle =
          job.title ||
          (window.meejobT ? window.meejobT("Untitled Job") : "Untitled Job");
        const item = document.createElement("div");
        item.className = "dash-item approval-item";

        item.innerHTML = `
          <div class="dash-main">
            <div class="dash-title" data-no-i18n>${escapeHTML(displayTitle)}</div>
            <div class="dash-meta">
              <span class="project-status status-pending">${escapeHTML(moderationLabel("pending"))}</span>
              <span>Posted ${escapeHTML(formatDate(job.created_at))}</span>
              ${job.salary ? `<span data-no-i18n>${escapeHTML(job.salary)}</span>` : ""}
            </div>
            <div class="approval-employer">
              Posted by: <span data-no-i18n>${escapeHTML(employerName)}</span>
            </div>
            <div class="approval-company" data-no-i18n>
              ${escapeHTML(job.company || "")}${job.location ? " · " + escapeHTML(job.location) : ""}
            </div>
            <p class="approval-description" data-no-i18n>${escapeHTML(displayDescription)}</p>
            ${job.contact ? `<div class="approval-contact">Contact: <span data-no-i18n>${escapeHTML(job.contact)}</span></div>` : ""}
          </div>
          <div class="dash-actions">
            <button type="button" class="btn btn-primary btn-sm"
              onclick="reviewJob('${escapeJS(job.id)}', 'approved')">
              Approve
            </button>
            <button type="button" class="btn btn-danger btn-sm"
              onclick="reviewJob('${escapeJS(job.id)}', 'rejected')">
              Reject
            </button>
          </div>
        `;

        list.appendChild(item);
      });

      content.innerHTML = "";
      content.appendChild(list);
    }

    async function reviewJob(jobId, decision) {
      if (!currentIsAdmin) {
        alert("Only the site owner can review jobs.");
        return;
      }
      if (decision !== "approved" && decision !== "rejected") {
        return;
      }
      const question =
        decision === "approved"
          ? "Approve this job?"
          : "Reject this job?";
      if (!window.confirm(question)) {
        return;
      }
      const result = await supabaseClient
        .from("jobs")
        .update({
          moderation_status: decision,
          moderation_note:
            decision === "rejected" ? "Rejected by the site owner." : "",
          reviewed_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .select("id");

      try {
        requireChangedRow(
          result,
          "Could not update job approval."
        );
      } catch (error) {
        alert(error.message || "Could not update job approval.");
        return;
      }

      await loadJobs();
      await refreshDashboard();
      alert(decision === "approved" ? "Job approved." : "Job rejected.");
    }

    async function deleteJob(jobId) {
      if (!currentUser) {
        return;
      }
      if (!window.confirm("Delete this job?")) {
        return;
      }
      const result = await supabaseClient
        .from("jobs")
        .delete()
        .eq("id", jobId)
        .eq("employer_id", currentUser.id)
        .select("id");

      try {
        requireChangedRow(
          result,
          "Could not delete the job."
        );
      } catch (error) {
        alert(error.message || "Could not delete the job.");
        return;
      }

      await loadJobs();
      await refreshDashboard();
      alert("Job deleted.");
    }

    /* ==========================================================================
       APPLICANTS — review, accept, decline
    ========================================================================== */

    async function openApplicants(projectId) {
      if (!currentUser) {
        openAuth("login");
        return;
      }

      const project =
        allProjects.find(function (item) {
          return item.id === projectId;
        }) ||
        myProjectsCache.find(function (item) {
          return item.id === projectId;
        });

      if (!project) {
        alert("Project could not be found.");
        return;
      }

      if (project.client_id !== currentUser.id) {
        alert("Only the project owner can review applicants.");
        return;
      }

      setText("applicantsTitle", "Applicants");
      setText(
        "applicantsSubtitle",
        project.title || "Untitled Project"
      );
      openModal("applicantsModal");
      await renderApplicants(project);
    }

    async function renderApplicants(project) {
      const content = document.getElementById("applicantsContent");
      if (!content) {
        return;
      }
      content.innerHTML = '<div class="empty-message">Loading applicants...</div>';

      try {
        const applicationsResult = await supabaseClient
          .from("applications")
          .select("id, project_id, freelancer_id, status, created_at")
          .eq("project_id", project.id)
          .order("created_at", { ascending: false });

        if (applicationsResult.error) {
          throw applicationsResult.error;
        }

        const applications = applicationsResult.data || [];

        if (!applications.length) {
          content.innerHTML = `
            <div class="empty-message">
              No one has applied to this project yet.
            </div>
          `;
          return;
        }

        const freelancerIds = Array.from(
          new Set(
            applications.map(function (application) {
              return application.freelancer_id;
            })
          )
        );

        const profilesResult = await supabaseClient
          .from("profiles")
          .select("id, name, role, bio, skills")
          .in("id", freelancerIds);

        if (profilesResult.error) {
          throw profilesResult.error;
        }

        const profileMap = new Map();
        (profilesResult.data || []).forEach(function (profile) {
          const clean = normalizeProfile(profile);
          profileMap.set(clean.id, clean);
        });

        const list = document.createElement("div");
        list.className = "applicant-list";

        applications.forEach(function (application) {
          const profile = profileMap.get(application.freelancer_id) || {
            id: application.freelancer_id,
            name: "Freelancer",
            role: "freelancer",
            skills: ""
          };
          const status = application.status || "pending";
          const initial = (profile.name || "F").charAt(0).toUpperCase();
          const row = document.createElement("div");
          row.className = "applicant";

          row.innerHTML = `
            <div class="applicant-avatar">${escapeHTML(initial)}</div>
            <div class="applicant-info">
              <div class="applicant-name" data-no-i18n>${escapeHTML(profile.name || "Freelancer")}</div>
              <div class="applicant-skills" ${profile.skills ? "data-no-i18n" : ""}>
                ${escapeHTML(profile.skills || "No skills listed.")}
              </div>
            </div>
            <span class="applicant-status ${escapeHTML(status)}">
              ${escapeHTML(statusLabel(status))}
            </span>
            <div class="applicant-actions">
              <button type="button" class="btn btn-secondary btn-sm"
                onclick="viewFreelancerById('${escapeJS(profile.id)}')">
                Profile
              </button>
              <button type="button" class="btn btn-secondary btn-sm"
                data-profile-id="${escapeHTML(profile.id)}"
                data-profile-name="${escapeHTML(profile.name)}"
                data-profile-role="freelancer"
                onclick="openChatFromButton(this)">
                Message
              </button>
              ${
                status !== "accepted"
                  ? `<button type="button" class="btn btn-primary btn-sm"
                      onclick="decideApplication('${escapeJS(application.id)}', 'accepted', '${escapeJS(profile.id)}', '${escapeJS(project.id)}')">
                      Accept
                    </button>`
                  : ""
              }
              ${
                status === "pending"
                  ? `<button type="button" class="btn btn-danger btn-sm"
                      onclick="decideApplication('${escapeJS(application.id)}', 'declined', '${escapeJS(profile.id)}', '${escapeJS(project.id)}')">
                      Decline
                    </button>`
                  : ""
              }
            </div>
          `;

          list.appendChild(row);
        });

        content.innerHTML = "";
        content.appendChild(list);
      } catch (error) {
        console.error("Loading applicants error:", error);
        content.innerHTML =
          '<div class="empty-message">Could not load applicants. Check that the Supabase policies in supabase/policies.sql have been applied.</div>';
      }
    }

    async function decideApplication(applicationId, decision, freelancerId, projectId) {
      if (!currentUser) {
        return;
      }

      const label = decision === "accepted" ? "Accept" : "Decline";
      if (!window.confirm(label + " this application?")) {
        return;
      }

      let projectStatusWarning = false;

      try {
        const updateResult = await supabaseClient
          .from("applications")
          .update({ status: decision })
          .eq("id", applicationId)
          .select("id");

        requireChangedRow(
          updateResult,
          "Could not update the application."
        );

        const project =
          allProjects.find(function (item) {
            return item.id === projectId;
          }) ||
          myProjectsCache.find(function (item) {
            return item.id === projectId;
          });

        if (decision === "accepted") {
          if (project) {
            const statusResult = await supabaseClient
              .from("projects")
              .update({ status: "in_progress" })
              .eq("id", projectId)
              .select("id");

            if (
              statusResult.error ||
              !statusResult.data ||
              !statusResult.data.length
            ) {
              projectStatusWarning = true;
              console.error(
                "Could not move the project to in_progress:",
                statusResult.error ||
                  "No project row was updated. Check the project policies."
              );
            }
          }

          await notifyUser(
            freelancerId,
            'Good news! Your application for "' +
              (project ? project.title : "a project") +
              '" was accepted. Let\'s talk about the details.'
          );
        }

        if (project) {
          await renderApplicants(project);
        }
        await loadProjects();
        await refreshDashboard();
        if (projectStatusWarning) {
          alert(
            "Application accepted, but the project status could not be updated."
          );
        }
      } catch (error) {
        console.error("Update application error:", error);
        alert(
          error.message ||
            "Could not update the application. Check the Supabase policies."
        );
      }
    }

    async function notifyUser(userId, message) {
      if (!currentUser || !userId) {
        return;
      }
      const result = await supabaseClient.from("messages").insert({
        sender_id: currentUser.id,
        receiver_id: userId,
        message: message,
        is_read: false
      });
      if (result.error) {
        console.error("Could not send notification message:", result.error);
      }
    }

    /* ==========================================================================
       PROJECT MANAGEMENT — edit, close, delete
    ========================================================================== */

    function openEditProject(projectId) {
      const project = allProjects.find(function (item) {
        return item.id === projectId;
      });

      if (!project) {
        alert("Project could not be found.");
        return;
      }

      if (!currentUser || project.client_id !== currentUser.id) {
        alert("Only the project owner can edit it.");
        return;
      }

      editingProjectId = projectId;

      document.getElementById("projectTitle").value = project.title || "";
      document.getElementById("projectDescription").value =
        project.description || "";
      document.getElementById("projectBudget").value =
        project.budget === null || project.budget === undefined
          ? ""
          : project.budget;
      document.getElementById("projectStatus").textContent = "";

      setText("projectModalTitle", "Edit Project");
      setText("saveProjectButton", "Save Changes");
      openModal("projectModal");
    }

    function closeProjectModal() {
      editingProjectId = null;
      setText("projectModalTitle", "Post a Project");
      setText("saveProjectButton", "Post Project");
      closeModal("projectModal");
    }

    async function setProjectStatus(projectId, status) {
      try {
        const result = await supabaseClient
          .from("projects")
          .update({ status: status })
          .eq("id", projectId)
          .select("id");

        requireChangedRow(
          result,
          "Could not update the project."
        );

        await loadProjects();
        await refreshDashboard();
      } catch (error) {
        console.error("Update project status error:", error);
        alert(error.message || "Could not update the project.");
      }
    }

    async function deleteProject(projectId) {
      if (
        !window.confirm(
          "Delete this project? Applications for it will be removed too."
        )
      ) {
        return;
      }

      try {
        // Delete the project first. If the database has no ON DELETE CASCADE
        // rule, remove its applications and try again.
        let result = await supabaseClient
          .from("projects")
          .delete()
          .eq("id", projectId)
          .select("id");

        if (result.error && result.error.code === "23503") {
          const applicationsResult = await supabaseClient
            .from("applications")
            .delete()
            .eq("project_id", projectId);
          if (applicationsResult.error) {
            throw applicationsResult.error;
          }
          result = await supabaseClient
            .from("projects")
            .delete()
            .eq("id", projectId)
            .select("id");
        }

        requireChangedRow(
          result,
          "Could not delete the project."
        );

        myProjectsCache = myProjectsCache.filter(function (project) {
          return project.id !== projectId;
        });
        allProjects = allProjects.filter(function (project) {
          return project.id !== projectId;
        });

        await loadProjects();
        await refreshDashboard();
      } catch (error) {
        console.error("Delete project error:", error);
        alert(error.message || "Could not delete the project.");
      }
    }

    /* ==========================================================================
       PASSWORD RESET
    ========================================================================== */

    async function sendPasswordReset() {
      const status = document.getElementById("authStatus");
      const email = document
        .getElementById("authEmail")
        .value.trim()
        .toLowerCase();

      if (!email) {
        status.style.color = "#dc2626";
        status.textContent =
          "Type your email address above, then click Forgot password.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.style.color = "#dc2626";
        status.textContent = "Please enter a valid email address.";
        return;
      }

      status.style.color = "#2563eb";
      status.textContent = "Sending reset link...";

      const result = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });

      if (result.error) {
        status.style.color = "#dc2626";
        status.textContent = result.error.message;
        return;
      }

      status.style.color = "#16a34a";
      status.textContent =
        "Reset link sent. Check your email inbox (and spam folder).";
    }

    async function saveNewPassword() {
      const password = document.getElementById("recoveryPassword").value;
      const confirm = document.getElementById("recoveryPasswordConfirm").value;
      const status = document.getElementById("recoveryStatus");
      const button = document.getElementById("recoverySubmitButton");

      if (password.length < 6) {
        status.style.color = "#dc2626";
        status.textContent = "Use at least 6 characters.";
        return;
      }

      if (password !== confirm) {
        status.style.color = "#dc2626";
        status.textContent = "Passwords do not match.";
        return;
      }

      button.disabled = true;
      status.style.color = "#2563eb";
      status.textContent = "Saving...";

      const result = await supabaseClient.auth.updateUser({
        password: password
      });

      button.disabled = false;

      if (result.error) {
        status.style.color = "#dc2626";
        status.textContent = result.error.message;
        return;
      }

      status.style.color = "#16a34a";
      status.textContent = "Password updated. You can log in now.";

      history.replaceState(null, "", window.location.pathname);

      setTimeout(function () {
        closeModal("recoveryModal");
        document.getElementById("recoveryPassword").value = "";
        document.getElementById("recoveryPasswordConfirm").value = "";
        status.textContent = "";
      }, 1400);
    }

    function initPasswordRecovery() {
      const hash = window.location.hash || "";
      if (hash.indexOf("type=recovery") !== -1) {
        openModal("recoveryModal");
      }

      supabaseClient.auth.onAuthStateChange(function (event) {
        if (event === "PASSWORD_RECOVERY") {
          openModal("recoveryModal");
        }
      });
    }

    /* ==========================================================================
       JOBS BOARD
    ========================================================================== */

    let allJobs = [];
    let myJobsCache = [];
    let editingJobId = null;
    let jobImageFile = null;
    let jobImageRemoved = false;
    let jobImageExistingUrl = "";
    const JOB_IMAGE_BUCKET = "job-images";
    const JOB_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
    let currentPosterJob = null;
    let posterImage = null;
    let posterFieldsLang = "lo";
    let jobQuery = "";
    let jobCategory = "all";
    let jobType = "all";
    let jobProvince = "all";

    const JOB_TYPES = {
      all: "All jobs",
      full_time: "Full-time",
      part_time: "Part-time",
      short_term: "Short-term"
    };

    const JOB_TYPE_KEYS = ["all", "full_time", "part_time", "short_term"];

    // All 17 provinces plus Vientiane Capital.
    const LAOS_PROVINCES = [
      { id: "vientiane-capital", en: "Vientiane Capital", lo: "ນະຄອນຫຼວງວຽງຈັນ" },
      { id: "phongsaly", en: "Phongsaly", lo: "ຜົ້ງສາລີ" },
      { id: "luang-namtha", en: "Luang Namtha", lo: "ຫຼວງນໍ້າທາ" },
      { id: "oudomxay", en: "Oudomxay", lo: "ອຸດົມໄຊ" },
      { id: "bokeo", en: "Bokeo", lo: "ບໍ່ແກ້ວ" },
      { id: "luang-prabang", en: "Luang Prabang", lo: "ຫຼວງພະບາງ" },
      { id: "houaphanh", en: "Houaphanh", lo: "ຫົວພັນ" },
      { id: "xayaboury", en: "Xayaboury", lo: "ໄຊຍະບູລີ" },
      { id: "xieng-khouang", en: "Xieng Khouang", lo: "ຊຽງຂວາງ" },
      { id: "vientiane-province", en: "Vientiane Province", lo: "ວຽງຈັນ" },
      { id: "bolikhamxay", en: "Bolikhamxay", lo: "ບໍລິຄຳໄຊ" },
      { id: "khammouane", en: "Khammouane", lo: "ຄຳມ່ວນ" },
      { id: "savannakhet", en: "Savannakhet", lo: "ສະຫວັນນະເຂດ" },
      { id: "salavan", en: "Salavan", lo: "ສາລະວັນ" },
      { id: "sekong", en: "Sekong", lo: "ເຊກອງ" },
      { id: "champasak", en: "Champasak", lo: "ຈຳປາສັກ" },
      { id: "attapeu", en: "Attapeu", lo: "ອັດຕະປື" },
      { id: "xaysomboun", en: "Xaysomboun", lo: "ໄຊສົມບູນ" }
    ];

    function findProvince(id) {
      return LAOS_PROVINCES.find(function (province) {
        return province.id === id;
      }) || null;
    }

    function findProvinceByText(value) {
      const text = String(value || "").trim().toLowerCase();
      if (!text) {
        return null;
      }
      const exact = LAOS_PROVINCES.find(function (province) {
        return text === province.en.toLowerCase() || text === province.lo;
      });
      if (exact) {
        return exact;
      }
      // Legacy jobs stored "Vientiane" for the capital.
      if (text === "vientiane" || text.startsWith("vientiane ·")) {
        return LAOS_PROVINCES[0];
      }
      return (
        LAOS_PROVINCES.find(function (province) {
          return (
            text.startsWith(province.en.toLowerCase()) ||
            text.startsWith(province.lo)
          );
        }) || null
      );
    }

    function hasLaoText(value) {
      return /[\u0E80-\u0EFF]/.test(String(value || ""));
    }

    function jobLocationLabel(job) {
      const lang = currentLang();
      const base = String(job.location || "").trim();
      const en = String(job.location_en || "").trim();
      if (lang === "en") {
        return en || base;
      }
      if (hasLaoText(base)) {
        return base;
      }
      const source = base || en;
      const province = findProvinceByText(source);
      if (province) {
        const separator = source.indexOf("·");
        const detail =
          separator === -1 ? "" : source.slice(separator + 1).trim();
        return detail ? province.lo + " · " + detail : province.lo;
      }
      return base || en;
    }

    function jobMatchesProvince(job, provinceId) {
      if (!provinceId || provinceId === "all") {
        return true;
      }
      const province = findProvince(provinceId);
      if (!province) {
        return true;
      }
      const text = [job.location, job.location_en]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .trim();
      if (text.indexOf(province.en.toLowerCase()) !== -1) {
        return true;
      }
      if (province.lo && text.indexOf(province.lo) !== -1) {
        return true;
      }
      if (provinceId === "vientiane-capital") {
        return /(^|\s)vientiane(\s|$)/.test(text) && text.indexOf("province") === -1;
      }
      return false;
    }

    function currentLang() {
      return document.documentElement.lang === "en" ? "en" : "lo";
    }

    function localized(job, field) {
      const lang = currentLang();
      const suffixed = job[field + "_" + lang];
      if (suffixed) {
        return String(suffixed);
      }
      return String(job[field] || "");
    }

    function normalizeJob(job) {
      return {
        ...job,
        job_type: String(job.job_type || "full_time"),
        category: String(job.category || "other"),
        status: String(job.status || "open"),
        moderation_status: String(
          job.moderation_status || "approved"
        )
      };
    }

    function jobSearchText(job) {
      // Search both languages so an English query works in Lao mode and vice versa.
      return [
        localized(job, "title"),
        job.title,
        job.title_lo,
        job.title_en,
        localized(job, "company"),
        job.company,
        job.company_lo,
        job.company_en,
        localized(job, "location"),
        job.location,
        job.location_en,
        jobLocationLabel(job),
        localized(job, "description"),
        job.description,
        job.description_lo,
        job.description_en,
        job.category,
        job.salary
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }

    async function loadJobs() {
      const container = document.getElementById("jobList");
      if (!container) {
        return;
      }
      const seeded =
        Array.isArray(window.MEEJOB_JOBS) ? window.MEEJOB_JOBS.slice() : [];
      allJobs = seeded.map(normalizeJob);
      renderJobFilters();
      renderProvinceGrid();
      renderJobs();
      updateCategoryCounts();
      updateProvinceCounts();
      updateHeroStats();

      try {
        const { data, error } = await supabaseClient
          .from("jobs")
          .select("*")
          .eq("status", "open")
          .eq("moderation_status", "approved")
          .order("created_at", { ascending: false });
        if (error) {
          throw error;
        }
        const dbJobs = (data || []).map(normalizeJob);
        if (dbJobs.length) {
          // Real jobs exist — hide the sample listings.
          allJobs = dbJobs;
          renderJobFilters();
          renderProvinceGrid();
          renderJobs();
          updateCategoryCounts();
          updateProvinceCounts();
          updateHeroStats();
        }
      } catch (error) {
        console.warn(
          "Jobs table unavailable; showing sample listings.",
          error && error.message ? error.message : error
        );
      }
    }

    function jobMatchesCategory(job, key) {
      if (key === "all") {
        return true;
      }
      const category = String(job.category || "").toLowerCase();
      if (category) {
        if (key === "other") {
          return category === "other";
        }
        return category === key;
      }
      if (key === "other") {
        return true;
      }
      const words = PROJECT_CATEGORIES[key] ? PROJECT_CATEGORIES[key].keywords : [];
      const text = jobSearchText(job);
      return words.some(function (word) {
        return textHasWord(text, word);
      });
    }

    function getVisibleJobs() {
      const query = jobQuery.trim().toLowerCase();
      return allJobs.filter(function (job) {
        if (jobType !== "all" && job.job_type !== jobType) {
          return false;
        }
        if (!jobMatchesCategory(job, jobCategory)) {
          return false;
        }
        if (!jobMatchesProvince(job, jobProvince)) {
          return false;
        }
        if (!query) {
          return true;
        }
        return jobSearchText(job).indexOf(query) !== -1;
      });
    }

    function countJobsInCategory(key) {
      return allJobs.filter(function (job) {
        return jobMatchesCategory(job, key);
      }).length;
    }

    function countJobsOfType(key) {
      if (key === "all") {
        return allJobs.length;
      }
      return allJobs.filter(function (job) {
        return job.job_type === key;
      }).length;
    }

    function renderJobFilters() {
      const typeWrap = document.getElementById("jobTypeFilters");
      const categoryWrap = document.getElementById("jobCategoryFilters");

      if (typeWrap) {
        typeWrap.innerHTML = JOB_TYPE_KEYS.map(function (key) {
          const active = jobType === key ? " is-active" : "";
          return (
            '<button type="button" class="job-filter' + active +
            '" onclick="setJobType(\'' + key + '\')">' +
            escapeHTML(JOB_TYPES[key]) +
            " (" + countJobsOfType(key) + ")</button>"
          );
        }).join("");
      }

      if (categoryWrap) {
        categoryWrap.innerHTML = PROJECT_CATEGORY_KEYS.map(function (key) {
          const active = jobCategory === key ? " is-active" : "";
          const label =
            key === "all" ? "All categories" : PROJECT_CATEGORIES[key].label;
          return (
            '<button type="button" class="job-filter' + active +
            '" onclick="setJobCategory(\'' + key + '\')">' +
            escapeHTML(label) +
            " (" + countJobsInCategory(key) + ")</button>"
          );
        }).join("");
      }
    }

    function fillProvinceOptions(selectId, includeAll) {
      const select = document.getElementById(selectId);
      if (!select) {
        return;
      }
      const selected = select.value;
      const options = LAOS_PROVINCES.map(function (province) {
        return (
          '<option value="' + province.id + '">' +
          escapeHTML(province.en) +
          "</option>"
        );
      });
      if (includeAll) {
        options.unshift('<option value="all">All provinces</option>');
      } else {
        options.unshift('<option value="">Choose a province</option>');
      }
      select.innerHTML = options.join("");
      if (selected) {
        select.value = selected;
      }
    }

    function renderProvinceGrid() {
      const grid = document.getElementById("provinceGrid");
      if (!grid) {
        return;
      }
      grid.innerHTML = LAOS_PROVINCES.map(function (province) {
        const active = jobProvince === province.id ? " is-active" : "";
        return (
          '<button type="button" class="province-card' + active +
          '" data-province="' + province.id + '"' +
          ' onclick="chooseProvince(\'' + province.id + '\')">' +
          '<span class="province-name">' + escapeHTML(province.en) + "</span>" +
          '<span class="province-count" data-province-count="' + province.id + '">0 open</span>' +
          "</button>"
        );
      }).join("");
    }

    function countJobsInProvince(provinceId) {
      return allJobs.filter(function (job) {
        return jobMatchesProvince(job, provinceId);
      }).length;
    }

    function updateProvinceCounts() {
      document.querySelectorAll("[data-province-count]").forEach(function (el) {
        el.textContent =
          countJobsInProvince(el.getAttribute("data-province-count")) + " open";
      });
    }

    function setJobProvince(provinceId) {
      jobProvince = findProvince(provinceId) ? provinceId : "all";
      const heroProvince = document.getElementById("heroProvince");
      if (heroProvince) {
        heroProvince.value = jobProvince;
      }
      const provinceFilter = document.getElementById("jobProvinceFilter");
      if (provinceFilter) {
        provinceFilter.value = jobProvince;
      }
      document.querySelectorAll(".province-card").forEach(function (card) {
        card.classList.toggle(
          "is-active",
          card.getAttribute("data-province") === jobProvince
        );
      });
      renderJobs();
    }

    function chooseProvince(provinceId) {
      setJobProvince(provinceId);
      const section = document.getElementById("jobs");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    function renderJobs() {
      const container = document.getElementById("jobList");
      if (!container) {
        return;
      }
      const jobs = getVisibleJobs();
      const note = document.getElementById("jobsNote");
      if (note) {
        note.textContent =
          jobs.length + " of " + allJobs.length + " jobs";
      }
      if (!jobs.length) {
        container.innerHTML =
          '<div class="empty-message">' +
          (jobQuery || jobCategory !== "all" || jobType !== "all" || jobProvince !== "all"
            ? "No jobs match your search. Try another category, job type or province."
            : "No jobs posted yet.") +
          "</div>";
        return;
      }
      container.innerHTML = jobs
        .map(function (job) {
          const typeKey = JOB_TYPES[job.job_type] ? job.job_type : "full_time";
          const typeLabel = JOB_TYPES[typeKey];
          const location = jobLocationLabel(job);
          return (
            '<article class="job-card">' +
            '<div class="job-card-top">' +
            '<span class="job-type job-type-' + escapeHTML(typeKey) + '">' +
            escapeHTML(typeLabel) + "</span>" +
            (job.sample ? '<span class="sample-badge">Sample</span>' : "") +
            "</div>" +
            (job.image_url
              ? '<img class="job-card-image" src="' +
                escapeHTML(job.image_url) +
                '" alt="" loading="lazy">'
              : "") +
            "<h3 data-no-i18n>" + escapeHTML(localized(job, "title")) + "</h3>" +
            '<p class="job-company" data-no-i18n>' + escapeHTML(localized(job, "company")) +
            (location ? " · " + escapeHTML(location) : "") + "</p>" +
            '<p class="job-desc" data-no-i18n>' + escapeHTML(localized(job, "description")) + "</p>" +
            '<div class="job-card-foot">' +
            '<strong class="job-salary"' + (job.salary ? " data-no-i18n" : "") + '>' +
            escapeHTML(job.salary || "Negotiable") + "</strong>" +
            '<button type="button" class="btn btn-secondary btn-sm" onclick="openJobDetail(\'' +
            escapeJS(String(job.id)) + '\')">View job</button>' +
            "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    function setJobType(key) {
      jobType = JOB_TYPES[key] ? key : "all";
      renderJobFilters();
      renderJobs();
    }

    function setJobCategory(key) {
      jobCategory = PROJECT_CATEGORIES[key] ? key : "all";
      const heroCategory = document.getElementById("heroCategory");
      if (heroCategory) {
        heroCategory.value = jobCategory;
      }
      document.querySelectorAll(".category-card").forEach(function (card) {
        card.classList.toggle(
          "is-active",
          card.getAttribute("data-category") === jobCategory
        );
      });
      renderJobFilters();
      renderJobs();
    }

    function onJobSearch(value) {
      jobQuery = String(value || "");
      renderJobs();
    }

    function contactLink(contact) {
      const raw = String(contact || "").trim();
      if (!raw) {
        return "";
      }
      const safe = escapeHTML(raw);
      if (/^[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+$/.test(raw)) {
        return '<a href="mailto:' + safe + '">' + safe + "</a>";
      }
      const digits = raw.replace(/[^\d+]/g, "");
      if (digits.length >= 6) {
        return '<a href="tel:' + escapeHTML(digits) + '">' + safe + "</a>";
      }
      return safe;
    }

    function openJobModal(jobId) {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (
        !currentIsAdmin &&
        (!currentProfile || currentProfile.role !== "client")
      ) {
        alert("Only clients can post jobs.");
        return;
      }
      if (!requireMembership()) {
        return;
      }

      let job = null;
      if (jobId) {
        job =
          myJobsCache.find(function (item) {
            return String(item.id) === String(jobId);
          }) ||
          allJobs.find(function (item) {
            return String(item.id) === String(jobId);
          });
        if (!job) {
          alert("Job could not be found.");
          return;
        }
      }

      editingJobId = job ? job.id : null;
      document.getElementById("jobTitle").value = job ? job.title || "" : "";
      document.getElementById("jobCompany").value = job ? job.company || "" : "";

      const jobProvinceSelect = document.getElementById("jobProvince");
      if (jobProvinceSelect) {
        const province = job
          ? findProvinceByText(job.location_en || job.location)
          : null;
        jobProvinceSelect.value = province ? province.id : "";
      }
      const jobLocationInput = document.getElementById("jobLocation");
      if (jobLocationInput) {
        let detail = job
          ? String(job.location || job.location_en || "").trim()
          : "";
        const province = job
          ? findProvinceByText(job.location_en || job.location)
          : null;
        if (province) {
          if (detail.toLowerCase().indexOf(province.en.toLowerCase()) === 0) {
            detail = detail.slice(province.en.length).replace(/^\s*·\s*/, "");
          } else if (detail === province.lo) {
            detail = "";
          } else {
            const separator = detail.indexOf("·");
            if (separator !== -1) {
              detail = detail.slice(separator + 1).trim();
            }
          }
        }
        jobLocationInput.value = detail;
      }
      const imagePreview = document.getElementById("jobImagePreview");
      const imagePreviewImg = document.getElementById("jobImagePreviewImg");
      const imageInput = document.getElementById("jobImage");
      jobImageFile = null;
      jobImageRemoved = false;
      jobImageExistingUrl = job && job.image_url ? String(job.image_url) : "";
      if (imageInput) {
        imageInput.value = "";
      }
      if (imagePreview && imagePreviewImg) {
        if (jobImageExistingUrl) {
          imagePreviewImg.src = jobImageExistingUrl;
          imagePreview.hidden = false;
        } else {
          imagePreviewImg.removeAttribute("src");
          imagePreview.hidden = true;
        }
      }
      document.getElementById("jobType").value =
        job && JOB_TYPES[job.job_type] ? job.job_type : "full_time";
      document.getElementById("jobCategory").value =
        job && PROJECT_CATEGORIES[job.category] ? job.category : "web-design";
      document.getElementById("jobSalary").value = job ? job.salary || "" : "";
      document.getElementById("jobContact").value = job ? job.contact || "" : "";
      document.getElementById("jobDescription").value = job
        ? job.description || ""
        : "";
      setText("jobModalTitle", editingJobId ? "Edit job" : "Post a Job");
      setText(
        "saveJobButton",
        editingJobId ? "Save Changes" : "Submit for approval"
      );
      const status = document.getElementById("jobFormStatus");
      status.textContent = "";
      status.style.color = "";
      openModal("jobModal");
    }

    function openEditJob(jobId) {
      openJobModal(jobId);
    }

    function jobImageStatus(message, color) {
      const status = document.getElementById("jobFormStatus");
      if (!status) {
        return;
      }
      status.style.color = color || "";
      status.textContent = message || "";
    }

    function onJobImageSelected(input) {
      const file = input && input.files ? input.files[0] : null;
      if (!file) {
        return;
      }
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        jobImageStatus("Please choose a JPG, PNG or WebP image.", "#dc2626");
        input.value = "";
        return;
      }
      if (file.size > JOB_IMAGE_MAX_BYTES) {
        jobImageStatus(
          "That image is larger than 5 MB. Please choose a smaller file.",
          "#dc2626"
        );
        input.value = "";
        return;
      }

      jobImageFile = file;
      jobImageRemoved = false;
      const preview = document.getElementById("jobImagePreview");
      const previewImg = document.getElementById("jobImagePreviewImg");
      if (preview && previewImg) {
        previewImg.src = URL.createObjectURL(file);
        preview.hidden = false;
      }
      jobImageStatus("", "");
    }

    function removeJobImage() {
      jobImageFile = null;
      jobImageRemoved = true;
      const input = document.getElementById("jobImage");
      const preview = document.getElementById("jobImagePreview");
      const previewImg = document.getElementById("jobImagePreviewImg");
      if (input) {
        input.value = "";
      }
      if (preview) {
        preview.hidden = true;
      }
      if (previewImg) {
        previewImg.removeAttribute("src");
      }
    }

    function resizeJobImage(file) {
      return new Promise(function (resolve, reject) {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = function () {
          const maxSide = 1600;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(objectUrl);
          canvas.toBlob(
            function (blob) {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Could not process the image."));
              }
            },
            "image/jpeg",
            0.85
          );
        };
        image.onerror = function () {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not read the image."));
        };
        image.src = objectUrl;
      });
    }

    async function uploadJobImage(file) {
      const blob = await resizeJobImage(file);
      const path =
        currentUser.id +
        "/" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8) +
        ".jpg";
      const { error } = await supabaseClient.storage
        .from(JOB_IMAGE_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) {
        throw error;
      }
      const { data } = supabaseClient.storage
        .from(JOB_IMAGE_BUCKET)
        .getPublicUrl(path);
      return data ? data.publicUrl : "";
    }

    async function createJob() {
      if (!currentUser) {
        openAuth("login");
        return;
      }
      if (
        !currentIsAdmin &&
        (!currentProfile || currentProfile.role !== "client")
      ) {
        alert("Only clients can post jobs.");
        return;
      }
      if (!requireMembership()) {
        return;
      }
      const title = document.getElementById("jobTitle").value.trim();
      const company = document.getElementById("jobCompany").value.trim();
      const provinceId = document.getElementById("jobProvince")
        ? document.getElementById("jobProvince").value
        : "";
      const province = findProvince(provinceId);
      const detail = document.getElementById("jobLocation").value.trim();
      const locationEn = province
        ? detail
          ? province.en + " · " + detail
          : province.en
        : detail;
      const locationLo = province
        ? detail
          ? province.lo + " · " + detail
          : province.lo
        : detail;
      const jobTypeValue = document.getElementById("jobType").value;
      const categoryValue = document.getElementById("jobCategory").value;
      const salary = document.getElementById("jobSalary").value.trim();
      const contact = document.getElementById("jobContact").value.trim();
      const description = document
        .getElementById("jobDescription")
        .value.trim();
      const status = document.getElementById("jobFormStatus");
      const button = document.getElementById("saveJobButton");

      if (!title) {
        status.style.color = "#dc2626";
        status.textContent = "Please enter a job title.";
        return;
      }
      if (!description) {
        status.style.color = "#dc2626";
        status.textContent = "Please enter a job description.";
        return;
      }
      if (!province && !detail) {
        status.style.color = "#dc2626";
        status.textContent = "Please choose a province.";
        return;
      }

      let imageUrl = jobImageExistingUrl || "";
      if (jobImageFile) {
        status.style.color = "#2563eb";
        status.textContent = "Uploading image...";
        try {
          imageUrl = await uploadJobImage(jobImageFile);
        } catch (error) {
          console.error("Job image upload error:", error);
          const message = error && error.message ? error.message : "";
          status.style.color = "#dc2626";
          status.textContent = /bucket not found/i.test(message)
            ? "Image upload is not available yet. You can post without an image."
            : message || "Could not upload the image.";
          return;
        }
      } else if (jobImageRemoved) {
        imageUrl = "";
      }

      status.style.color = "#2563eb";
      status.textContent = "Submitting for approval...";
      if (button) {
        button.disabled = true;
      }
      const fields = {
        title: title,
        company: company,
        location: locationLo,
        location_en: locationEn,
        description: description,
        job_type: JOB_TYPES[jobTypeValue] ? jobTypeValue : "full_time",
        category: PROJECT_CATEGORIES[categoryValue] ? categoryValue : "other",
        salary: salary,
        contact: contact
      };
      // Only touch image_url when there is an image to save or remove, so
      // posting still works before supabase/job-images.sql has been run.
      if (imageUrl || jobImageRemoved) {
        fields.image_url = imageUrl || null;
      }

      try {
        let savedJobId = editingJobId;
        let error = null;

        if (editingJobId) {
          const result = await supabaseClient
            .from("jobs")
            .update(fields)
            .eq("id", editingJobId)
            .eq("employer_id", currentUser.id)
            .select("id")
            .single();
          error = result.error;
          if (result.data) {
            savedJobId = result.data.id;
          }
        } else {
          const result = await supabaseClient
            .from("jobs")
            .insert({
              ...fields,
              employer_id: currentUser.id,
              status: "open",
              moderation_status: "pending"
            })
            .select("id")
            .single();
          error = result.error;
          if (result.data) {
            savedJobId = result.data.id;
          }
        }

        if (error) {
          status.style.color = "#dc2626";
          if (isSchemaMissing(error)) {
            status.textContent =
              "The jobs table is not set up yet. Run supabase/meejob.sql in the Supabase SQL editor.";
          } else if (
            String(error.message || "").indexOf("prohibited language") !== -1
          ) {
            status.textContent =
              "Job text contains prohibited language. Please remove profanity and try again.";
          } else if (
            String(error.message || "").indexOf("Only an administrator") !== -1
          ) {
            status.textContent =
              "Only an administrator can change job approval status.";
          } else {
            status.textContent = error.message || "Could not publish the job.";
          }
          return;
        }

        const wasEditing = Boolean(editingJobId);
        status.style.color = "#16a34a";
        status.textContent = wasEditing
          ? "Job updated. It will be reviewed again if the content changed."
          : "Job submitted for approval. It will appear after the site owner approves it.";
        await loadJobs();
        if (wasEditing) {
          await refreshDashboard();
        }
        editingJobId = null;
        setTimeout(function () {
          closeModal("jobModal");
          if (!wasEditing && savedJobId) {
            openPosterStudio(savedJobId);
          }
        }, wasEditing ? 1800 : 2200);
      } catch (error) {
        console.error(error);
        status.style.color = "#dc2626";
        status.textContent = error.message || "Could not publish the job.";
      } finally {
        if (button) {
          button.disabled = false;
        }
      }
    }

    function openJobDetail(id) {
      if (!currentUser) {
        showPreviewGate();
        return;
      }
      const job = allJobs.find(function (item) {
        return String(item.id) === String(id);
      });
      if (!job) {
        return;
      }
      const body = document.getElementById("jobDetailBody");
      if (!body) {
        return;
      }
      const typeLabel = JOB_TYPES[job.job_type] || "Full-time";
      const categoryLabel =
        (PROJECT_CATEGORIES[job.category] || {}).label || "Other";
      const location = jobLocationLabel(job);
      body.innerHTML =
        '<div class="job-card-top">' +
        '<span class="job-type job-type-' + escapeHTML(job.job_type) + '">' +
        escapeHTML(typeLabel) + "</span>" +
        (job.sample ? '<span class="sample-badge">Sample</span>' : "") +
        "</div>" +
        '<h2 id="jobDetailTitle" data-no-i18n>' + escapeHTML(localized(job, "title")) + "</h2>" +
        '<p class="job-company" data-no-i18n>' + escapeHTML(localized(job, "company")) +
        (location ? " · " + escapeHTML(location) : "") + "</p>" +
        (job.image_url
          ? '<img class="job-detail-image" src="' +
            escapeHTML(job.image_url) +
            '" alt="">'
          : "") +
        '<div class="job-detail-meta">' +
        "<span><strong>Salary</strong> " + (job.salary ? '<span data-no-i18n>' + escapeHTML(job.salary) + "</span>" : escapeHTML("Negotiable")) + "</span>" +
        "<span><strong>Category</strong> " + escapeHTML(categoryLabel) + "</span>" +
        "</div>" +
        '<p class="job-detail-desc" data-no-i18n>' + escapeHTML(localized(job, "description")) + "</p>" +
        (job.contact
          ? '<div class="job-contact"><strong>Contact</strong> <span data-no-i18n>' + contactLink(job.contact) + "</span></div>"
          : "") +
        (job.sample
          ? '<p class="small text-muted job-sample-note">This is a sample listing used to demonstrate the board.</p>'
          : "");
      openModal("jobDetailModal");
    }

    /* ==========================================================================
       JOB POSTER STUDIO
    ========================================================================== */

    let posterLogoPromise = null;

    function posterSiteUrl() {
      return window.location.origin + window.location.pathname;
    }

    function posterHash(value) {
      const text = String(value || "");
      let hash = 0;
      for (let i = 0; i < text.length; i += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    }

    function posterColor(hex, alpha) {
      const raw = String(hex || "#eb4f69").replace("#", "");
      const full =
        raw.length === 3
          ? raw.split("").map(function (c) { return c + c; }).join("")
          : raw;
      const value = parseInt(full || "eb4f69", 16);
      const r = (value >> 16) & 255;
      const g = (value >> 8) & 255;
      const b = value & 255;
      return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }

    function posterShade(hex, percent) {
      const raw = String(hex || "#eb4f69").replace("#", "");
      const full =
        raw.length === 3
          ? raw.split("").map(function (c) { return c + c; }).join("")
          : raw;
      const value = parseInt(full || "eb4f69", 16);
      let r = (value >> 16) & 255;
      let g = (value >> 8) & 255;
      let b = value & 255;
      r = Math.max(0, Math.min(255, Math.round(r + (percent / 100) * 255)));
      g = Math.max(0, Math.min(255, Math.round(g + (percent / 100) * 255)));
      b = Math.max(0, Math.min(255, Math.round(b + (percent / 100) * 255)));
      return (
        "#" +
        [r, g, b]
          .map(function (part) { return part.toString(16).padStart(2, "0"); })
          .join("")
      );
    }

    function posterRoundRect(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function posterWrapText(ctx, text, maxWidth, maxLines) {
      const clean = String(text || "").replace(/\r/g, "").trim();
      if (!clean) {
        return [];
      }
      const lines = [];
      clean.split(/\n+/).forEach(function (paragraph) {
        const words = paragraph.split(/\s+/).filter(Boolean);
        let current = "";
        words.forEach(function (word) {
          const candidate = current ? current + " " + word : word;
          if (ctx.measureText(candidate).width <= maxWidth) {
            current = candidate;
            return;
          }
          if (current) {
            lines.push(current);
            current = "";
          }
          let chunk = "";
          Array.from(word).forEach(function (character) {
            const test = chunk + character;
            if (ctx.measureText(test).width > maxWidth && chunk) {
              lines.push(chunk);
              chunk = character;
            } else {
              chunk = test;
            }
          });
          current = chunk;
        });
        if (current) {
          lines.push(current);
        }
      });
      const limited = lines.slice(0, maxLines);
      if (lines.length > maxLines && limited.length) {
        let last = limited[limited.length - 1];
        while (last.length && ctx.measureText(last + "…").width > maxWidth) {
          last = last.slice(0, -1);
        }
        limited[limited.length - 1] = last + "…";
      }
      return limited;
    }

    function posterDrawCover(ctx, image, x, y, width, height) {
      const scale = Math.max(width / image.width, height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      ctx.drawImage(
        image,
        x + (width - drawWidth) / 2,
        y + (height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
    }

    function loadPosterLogo() {
      if (!posterLogoPromise) {
        posterLogoPromise = new Promise(function (resolve) {
          const image = new Image();
          image.onload = function () { resolve(image); };
          image.onerror = function () { resolve(null); };
          image.src = "meejob-icon.svg";
        });
      }
      return posterLogoPromise;
    }

    function posterAutoFields(job, lang) {
      const details = [];
      if (job.salary) {
        details.push(
          (lang === "lo" ? "ເງິນເດືອນ: " : "Salary: ") + job.salary
        );
      }
      const description =
        job["description_" + lang] || job.description || "";
      if (description) {
        details.push(String(description).slice(0, 300));
      }
      if (job.contact) {
        details.push(
          (lang === "lo" ? "ຕິດຕໍ່: " : "Contact: ") + job.contact
        );
      }
      return {
        headline: job["title_" + lang] || job.title || "",
        subline: [
          job["company_" + lang] || job.company || "",
          job["location_" + lang] || job.location || ""
        ]
          .filter(Boolean)
          .join(" · "),
        details: details.join("\n")
      };
    }

    function fillPosterFields(job, lang, force) {
      if (!job) {
        return;
      }
      const oldAuto = posterAutoFields(job, posterFieldsLang);
      const newAuto = posterAutoFields(job, lang);
      const fields = {
        posterHeadline: "headline",
        posterSubline: "subline",
        posterDetails: "details"
      };
      Object.keys(fields).forEach(function (id) {
        const input = document.getElementById(id);
        if (!input) {
          return;
        }
        const key = fields[id];
        if (force || !input.value.trim() || input.value === oldAuto[key]) {
          input.value = newAuto[key];
        }
      });
      posterFieldsLang = lang;
    }

    async function openPosterStudio(jobId) {
      if (!requireMembership()) {
        return;
      }
      let job =
        myJobsCache.find(function (item) {
          return String(item.id) === String(jobId);
        }) ||
        allJobs.find(function (item) {
          return String(item.id) === String(jobId);
        });

      if (!job) {
        const result = await supabaseClient
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();
        if (!result.error) {
          job = result.data;
        }
      }

      if (!job) {
        alert("Job could not be found.");
        return;
      }

      currentPosterJob = job;
      posterImage = null;
      const lang = currentLang();
      document.getElementById("posterLanguage").value = lang;
      document.getElementById("posterTemplate").value = "modern";
      document.getElementById("posterAccent").value = "#eb4f69";
      fillPosterFields(job, lang, true);
      document.getElementById("posterCaption").value = "";
      const fileInput = document.getElementById("posterPhoto");
      if (fileInput) {
        fileInput.value = "";
      }
      setPosterStatus("", "");
      openModal("posterModal");
      generatePosterCaption();
      await renderPoster();
    }

    function posterLanguageChanged() {
      const lang =
        document.getElementById("posterLanguage").value || "lo";
      fillPosterFields(currentPosterJob, lang, false);
      generatePosterCaption();
      renderPoster();
    }

    function generatePosterCaption() {
      const caption = document.getElementById("posterCaption");
      if (!caption || !currentPosterJob) {
        return;
      }
      const lang = document.getElementById("posterLanguage").value || "lo";
      const title =
        document.getElementById("posterHeadline").value.trim() ||
        currentPosterJob["title_" + lang] ||
        currentPosterJob.title ||
        "";
      const company =
        currentPosterJob["company_" + lang] ||
        currentPosterJob.company ||
        document.getElementById("posterSubline").value;
      const location =
        currentPosterJob["location_" + lang] || currentPosterJob.location || "";
      const salary = currentPosterJob.salary || "";
      const contact = currentPosterJob.contact || "";
      const description = String(
        currentPosterJob["description_" + lang] ||
          currentPosterJob.description ||
          ""
      ).slice(0, 220);
      const url = posterSiteUrl();
      const hash = posterHash(String(currentPosterJob.id || title) + lang);
      const hooksLo = [
        "📢 ຮັບສະໝັກດ່ວນ!",
        "🚀 ມາຮ່ວມທີມກັບພວກເຮົາ!",
        "💼 ໂອກາດວຽກໃໝ່!"
      ];
      const hooksEn = [
        "📢 We're hiring!",
        "🚀 Join our team!",
        "💼 New opportunity!"
      ];
      const lines = [];
      if (lang === "lo") {
        lines.push(hooksLo[hash % hooksLo.length]);
        lines.push("ຕຳແໜ່ງ: " + title);
        if (company) lines.push("ບໍລິສັດ: " + company);
        if (location) lines.push("ສະຖານທີ່: " + location);
        if (salary) lines.push("ເງິນເດືອນ: " + salary);
        if (description) lines.push("ລາຍລະອຽດ: " + description);
        lines.push("ຕິດຕໍ່: " + (contact || url));
        lines.push("ສະໝັກຜ່ານ MEEJOB: " + url);
        lines.push("#MEEJOB #ວຽກລາວ #ສະໝັກງານ");
      } else {
        lines.push(hooksEn[hash % hooksEn.length]);
        lines.push("Role: " + title);
        if (company) lines.push("Company: " + company);
        if (location) lines.push("Location: " + location);
        if (salary) lines.push("Salary: " + salary);
        if (description) lines.push("About the role: " + description);
        lines.push("Contact: " + (contact || url));
        lines.push("Apply on MEEJOB: " + url);
        lines.push("#MEEJOB #LaoJobs #Hiring");
      }
      caption.value = lines.join("\n");
    }

    function autoDesignPoster() {
      const templates = ["modern", "bold", "minimal"];
      const accents = ["#eb4f69", "#c93a55", "#dba948", "#ff9878", "#171832"];
      document.getElementById("posterTemplate").value =
        templates[Math.floor(Math.random() * templates.length)];
      document.getElementById("posterAccent").value =
        accents[Math.floor(Math.random() * accents.length)];
      renderPoster();
      setPosterStatus("New design generated.", "#16a34a");
    }

    async function renderPoster() {
      const canvas = document.getElementById("posterCanvas");
      if (!canvas || !currentPosterJob) {
        return;
      }
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (error) {
          /* keep drawing with fallback fonts */
        }
      }

      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const lang = document.getElementById("posterLanguage").value || "lo";
      const template = document.getElementById("posterTemplate").value || "modern";
      const accent = document.getElementById("posterAccent").value || "#eb4f69";
      const ink = "#171832";
      const cream = "#fff9f0";
      const isMinimal = template === "minimal";
      const isBold = template === "bold";
      const textColor = isMinimal ? ink : "#ffffff";
      const subColor = isMinimal ? "#5b5c73" : "rgba(255,255,255,0.82)";
      const fontDisplay = '"Noto Serif Lao", "Noto Sans Lao Looped", Georgia, serif';
      const fontSans = '"Noto Sans Lao Looped", "Inter", Arial, sans-serif';

      ctx.clearRect(0, 0, width, height);

      if (posterImage) {
        posterDrawCover(ctx, posterImage, 0, 0, width, height);
        ctx.fillStyle = isMinimal
          ? "rgba(255,249,240,0.86)"
          : "rgba(23,24,50,0.74)";
        ctx.fillRect(0, 0, width, height);
      } else if (isMinimal) {
        ctx.fillStyle = cream;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = posterColor(accent, 0.08);
        ctx.beginPath();
        ctx.arc(width - 40, 120, 260, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(0.55, posterShade(accent, -18));
        gradient.addColorStop(1, ink);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      if (isBold) {
        ctx.fillStyle = posterColor(accent, 0.9);
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(width, 360);
        ctx.lineTo(width - 360, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.arc(width - 120, height - 160, 300, 0, Math.PI * 2);
        ctx.fill();
      } else if (!isMinimal && !posterImage) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.arc(width - 80, 120, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isMinimal) {
        ctx.fillStyle = accent;
        ctx.fillRect(0, 0, width, 18);
        ctx.fillRect(54, 260, 8, height - 380);
      }

      const logo = await loadPosterLogo();
      ctx.fillStyle = isMinimal ? "#ffffff" : "rgba(255,255,255,0.94)";
      posterRoundRect(ctx, 62, 54, 100, 118, 20);
      ctx.fill();
      if (logo) {
        ctx.drawImage(logo, 74, 66, 76, 96);
      }

      ctx.fillStyle = textColor;
      ctx.font = '800 46px ' + fontDisplay;
      ctx.fillText("MEEJOB", 184, 118);
      ctx.font = '500 22px ' + fontSans;
      ctx.fillStyle = subColor;
      ctx.fillText(
        lang === "lo" ? "ຕະຫຼາດວຽກລາວ" : "LAO JOB MARKETPLACE",
        186,
        154
      );

      const badgeText = lang === "lo" ? "ຮັບສະໝັກ" : "WE'RE HIRING";
      ctx.font = '700 27px ' + fontSans;
      const badgeWidth = ctx.measureText(badgeText).width + 54;
      ctx.fillStyle = accent;
      posterRoundRect(ctx, 70, 244, badgeWidth, 58, 29);
      ctx.fill();
      ctx.fillStyle = isMinimal || isBold ? "#ffffff" : ink;
      ctx.fillText(badgeText, 97, 283);

      const headline =
        document.getElementById("posterHeadline").value.trim() ||
        currentPosterJob.title ||
        "";
      const titleSize = headline.length > 64 ? 68 : headline.length > 42 ? 78 : 88;
      ctx.font = '800 ' + titleSize + 'px ' + fontDisplay;
      ctx.fillStyle = textColor;
      const titleLines = posterWrapText(ctx, headline, width - 140, 3);
      let y = 390;
      titleLines.forEach(function (line) {
        ctx.fillText(line, 70, y);
        y += titleSize * 1.16;
      });

      const subline =
        document.getElementById("posterSubline").value.trim() || "";
      if (subline) {
        ctx.font = '600 32px ' + fontSans;
        ctx.fillStyle = subColor;
        const subLines = posterWrapText(ctx, subline, width - 140, 2);
        subLines.forEach(function (line) {
          ctx.fillText(line, 70, y + 8);
          y += 42;
        });
      }

      const details =
        document.getElementById("posterDetails").value.trim() || "";
      if (details) {
        ctx.font = '500 29px ' + fontSans;
        ctx.fillStyle = textColor;
        const detailLines = posterWrapText(ctx, details, width - 140, 5);
        let detailY = Math.max(y + 38, 790);
        detailLines.forEach(function (line) {
          ctx.fillText(line, 70, detailY);
          detailY += 42;
        });
      }

      ctx.fillStyle = isMinimal
        ? "rgba(23,24,50,0.06)"
        : "rgba(255,255,255,0.12)";
      posterRoundRect(ctx, 70, height - 238, width - 140, 142, 24);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = '800 29px ' + fontSans;
      ctx.fillText(
        lang === "lo" ? "ສະໝັກຜ່ານ MEEJOB" : "APPLY ON MEEJOB",
        102,
        height - 182
      );
      ctx.fillStyle = subColor;
      ctx.font = '500 25px ' + fontSans;
      ctx.fillText(posterSiteUrl(), 102, height - 138);

      ctx.textAlign = "right";
      ctx.fillStyle = subColor;
      ctx.font = '600 21px ' + fontSans;
      ctx.fillText(
        lang === "lo"
          ? "ຊອກວຽກ. ສ້າງອະນາຄົດ."
          : "Find Work. Build Your Future.",
        width - 70,
        height - 58
      );
      ctx.textAlign = "left";
    }

    function loadPosterPhoto(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      if (!/^image\//.test(file.type)) {
        setPosterStatus("Please choose a PNG, JPG or WebP image.", "#dc2626");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setPosterStatus("Please choose an image smaller than 8 MB.", "#dc2626");
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        const image = new Image();
        image.onload = function () {
          posterImage = image;
          renderPoster();
          setPosterStatus("Photo added to the poster.", "#16a34a");
        };
        image.onerror = function () {
          setPosterStatus("Could not read that image.", "#dc2626");
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    }

    function clearPosterPhoto() {
      posterImage = null;
      const input = document.getElementById("posterPhoto");
      if (input) {
        input.value = "";
      }
      renderPoster();
      setPosterStatus("Photo removed.", "#16a34a");
    }

    function setPosterStatus(message, color) {
      const status = document.getElementById("posterStatus");
      if (!status) {
        return;
      }
      status.textContent = message || "";
      status.style.color = color || "";
    }

    function downloadPoster() {
      const canvas = document.getElementById("posterCanvas");
      if (!canvas) {
        return;
      }
      canvas.toBlob(function (blob) {
        if (!blob) {
          setPosterStatus("Could not create the image.", "#dc2626");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          "meejob-poster-" +
          String(currentPosterJob && currentPosterJob.id ? currentPosterJob.id : "job").slice(0, 8) +
          ".png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1000);
        setPosterStatus("Poster downloaded.", "#16a34a");
      }, "image/png");
    }

    function sharePoster() {
      const canvas = document.getElementById("posterCanvas");
      if (!canvas) {
        return;
      }
      canvas.toBlob(async function (blob) {
        if (!blob) {
          setPosterStatus("Could not create the image.", "#dc2626");
          return;
        }
        const file = new File([blob], "meejob-poster.png", {
          type: "image/png"
        });
        const caption = document.getElementById("posterCaption").value;
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "MEEJOB job poster",
              text: caption
            });
            setPosterStatus("Shared.", "#16a34a");
            return;
          }
        } catch (error) {
          if (error && error.name === "AbortError") {
            return;
          }
        }
        downloadPoster();
        copyPosterCaption();
        setPosterStatus(
          "Sharing files is not supported here. The poster was downloaded and the caption copied.",
          "#b45309"
        );
      }, "image/png");
    }

    async function copyPosterCaption() {
      const caption = document.getElementById("posterCaption");
      if (!caption) {
        return;
      }
      const text = caption.value;
      try {
        await navigator.clipboard.writeText(text);
        setPosterStatus("Caption copied.", "#16a34a");
      } catch (error) {
        caption.focus();
        caption.select();
        document.execCommand("copy");
        setPosterStatus("Caption copied.", "#16a34a");
      }
    }

    /* ==========================================================================
       PROJECT FILTERS
    ========================================================================== */

    let projectQuery = "";
    let projectCategory = "all";

    const PROJECT_CATEGORIES = {
      all: {
        label: "All work",
        keywords: []
      },
      "web-design": {
        label: "Web design",
        keywords: [
          "web", "website", "landing", "html", "css", "ui", "ux",
          "ເວັບ", "ອອກແບບເວັບ", "ໜ້າເວັບ"
        ]
      },
      app: {
        label: "App development",
        keywords: [
          "app", "mobile", "ios", "android", "flutter", "react native",
          "ແອັບ", "ມືຖື"
        ]
      },
      project: {
        label: "Project work",
        keywords: [
          "project", "management", "manager", "planning", "coordination",
          "ໂຄງການ", "ບໍລິຫານ", "ຈັດການ"
        ]
      },
      engineering: {
        label: "Engineering",
        keywords: [
          "engineer", "engineering", "civil", "mechanical", "electrical",
          "construction", "ວິສະວະ", "ກໍ່ສ້າງ", "ໄຟຟ້າ", "ກົນຈັກ"
        ]
      },
      graphics: {
        label: "Graphic design",
        keywords: [
          "graphic", "logo", "brand", "branding", "photoshop", "illustrator",
          "ກຣາຟິກ", "ໂລໂກ້", "ແບຣນ"
        ]
      },
      content: {
        label: "Content & writing",
        keywords: [
          "content", "writing", "writer", "blog", "copy", "article", "script",
          "ຂຽນ", "ເນື້ອຫາ", "ບົດຄວາມ"
        ]
      },
      marketing: {
        label: "Marketing",
        keywords: [
          "marketing", "seo", "ads", "facebook", "social", "campaign",
          "ຕະຫຼາດ", "ໂຄສະນາ"
        ]
      },
      other: {
        label: "Other",
        keywords: []
      }
    };

    const PROJECT_CATEGORY_KEYS = [
      "all",
      "web-design",
      "app",
      "project",
      "engineering",
      "graphics",
      "content",
      "marketing",
      "other"
    ];

    function projectText(project) {
      return [
        project.title,
        project.description,
        project.skills,
        project.category
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }

    function textHasWord(text, word) {
      if (!word) {
        return false;
      }
      // Lao has no spaces between words, so match it as a substring.
      if (/[^\x00-\x7F]/.test(word)) {
        return text.indexOf(word) !== -1;
      }
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Require a word start so "script" does not match "JavaScript".
      return new RegExp("(^|[^a-z0-9])" + escaped, "i").test(text);
    }

    function matchesProjectCategory(project, key) {
      if (key === "all") {
        return true;
      }
      const words = PROJECT_CATEGORIES[key].keywords;
      if (!words.length) {
        return false;
      }
      const text = projectText(project);
      return words.some(function (word) {
        return textHasWord(text, word);
      });
    }

    function matchesOtherCategory(project) {
      return !PROJECT_CATEGORY_KEYS.some(function (key) {
        if (key === "all" || key === "other") {
          return false;
        }
        return matchesProjectCategory(project, key);
      });
    }

    function countProjectsInCategory(key) {
      return allProjects.filter(function (project) {
        if (key === "other") {
          return matchesOtherCategory(project);
        }
        return matchesProjectCategory(project, key);
      }).length;
    }

    function getVisibleProjects() {
      const query = projectQuery.trim().toLowerCase();
      return allProjects.filter(function (project) {
        const inCategory =
          projectCategory === "other"
            ? matchesOtherCategory(project)
            : matchesProjectCategory(project, projectCategory);
        if (!inCategory) {
          return false;
        }
        if (!query) {
          return true;
        }
        return projectText(project).indexOf(query) !== -1;
      });
    }

    function renderProjectFilters() {
      const wrap = document.getElementById("projectFilters");
      if (!wrap) {
        return;
      }
      wrap.innerHTML = PROJECT_CATEGORY_KEYS.map(function (key) {
        const active = projectCategory === key ? " is-active" : "";
        return (
          '<button type="button" class="job-filter' + active +
          '" onclick="setProjectCategory(\'' + key + '\')">' +
          escapeHTML(PROJECT_CATEGORIES[key].label) +
          " (" + countProjectsInCategory(key) + ")</button>"
        );
      }).join("");
    }

    function updateCategoryCounts() {
      document.querySelectorAll("[data-count-for]").forEach(function (el) {
        const key = el.getAttribute("data-count-for");
        el.textContent = countJobsInCategory(key) + " open";
      });
    }

    function setProjectCategory(key) {
      projectCategory = PROJECT_CATEGORIES[key] ? key : "all";
      renderProjectFilters();
      renderProjects(getVisibleProjects());
    }

    function chooseCategory(key) {
      setJobCategory(key);
      const section = document.getElementById("jobs");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    function onProjectSearch(value) {
      projectQuery = String(value || "");
      renderProjects(getVisibleProjects());
    }

    function scrollToProjects() {
      const section = document.getElementById("projects");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }

    function searchFromHero(event) {
      if (event) {
        event.preventDefault();
      }
      const input = document.getElementById("heroSearchInput");
      const select = document.getElementById("heroCategory");
      const provinceSelect = document.getElementById("heroProvince");
      jobQuery = input ? input.value : "";
      jobCategory =
        select && PROJECT_CATEGORIES[select.value] ? select.value : "all";
      jobProvince =
        provinceSelect && findProvince(provinceSelect.value)
          ? provinceSelect.value
          : "all";

      const jobSearch = document.getElementById("jobSearch");
      if (jobSearch) {
        jobSearch.value = jobQuery;
      }

      const provinceFilter = document.getElementById("jobProvinceFilter");
      if (provinceFilter) {
        provinceFilter.value = jobProvince;
      }

      document.querySelectorAll(".category-card").forEach(function (card) {
        card.classList.toggle(
          "is-active",
          card.getAttribute("data-category") === jobCategory
        );
      });

      document.querySelectorAll(".province-card").forEach(function (card) {
        card.classList.toggle(
          "is-active",
          card.getAttribute("data-province") === jobProvince
        );
      });

      renderJobFilters();
      renderJobs();

      const section = document.getElementById("jobs");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      return false;
    }

    /* ==========================================================================
       PREVIEW GATE — visitors must sign up before using member features
    ========================================================================== */

    const PREVIEW_SEEN_KEY = "meejob_preview_seen";

    function showPreviewGate() {
      if (currentUser) {
        return;
      }
      openModal("previewModal");
    }

    function dismissPreviewGate() {
      closeModal("previewModal");
      try {
        sessionStorage.setItem(PREVIEW_SEEN_KEY, "1");
      } catch (error) {
        /* ignore storage failures */
      }
    }

    function maybeShowPreviewGate() {
      if (currentUser) {
        return;
      }
      let seen = null;
      try {
        seen = sessionStorage.getItem(PREVIEW_SEEN_KEY);
      } catch (error) {
        seen = null;
      }
      if (seen) {
        return;
      }
      window.setTimeout(showPreviewGate, 900);
    }

    // A restored session can finish loading just after the preview gate was
    // scheduled. Close the gate as soon as we know the visitor is signed in,
    // so it never stacks on top of the profile, dashboard or membership modal.
    if (
      window.supabaseClient &&
      supabaseClient.auth &&
      typeof supabaseClient.auth.onAuthStateChange === "function"
    ) {
      supabaseClient.auth.onAuthStateChange(function (_event, session) {
        if (session && session.user) {
          closeModal("previewModal");
        }
      });
    }

    /* ==========================================================================
       STARTUP EXTRAS
    ========================================================================== */

    setText("footerYear", new Date().getFullYear());
    initPasswordRecovery();
    updateHeroStats();
