/* =============================================================================
   MEEJOB — language layer (English / Lao)
   -----------------------------------------------------------------------------
   The site markup stays in English so both languages share one source. When
   Lao is active, every visible string is swapped through the dictionary below
   (including text added later by app.js). The choice is stored in localStorage.

   To add a string: add its exact English text as a key in LO.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "meejob_lang";
  var LEGACY_STORAGE_KEY = "buildmate_lang";
  var DEFAULT_LANG = "lo";

  var stored = null;
  try {
    stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  var lang = stored === "en" || stored === "lo" ? stored : DEFAULT_LANG;

  var LO = {
    /* --- navigation / hero ------------------------------------------------ */
    "Skip to content": "ຂ້າມໄປຫາເນື້ອຫາ",
    Features: "ຄຸນສົມບັດ",
    Freelancers: "ຟຣີແລນຊ໌",
    Projects: "ໂຄງການ",
    Jobs: "ວຽກ",
    "How It Works": "ວິທີໃຊ້ງານ",
    About: "ກ່ຽວກັບ",
    "Log In": "ເຂົ້າສູ່ລະບົບ",
    "Get Started": "ເລີ່ມຕົ້ນ",
    "My Projects": "ໂຄງການຂອງຂ້ອຍ",
    "💬 Messages": "💬 ຂໍ້ຄວາມ",
    Profile: "ໂປຣໄຟລ໌",
    "Back to top": "ກັບຂຶ້ນເທິງ",
    "Log in": "ເຂົ້າສູ່ລະບົບ",
    "Get started": "ເລີ່ມຕົ້ນ",
    "Freelance marketplace": "ຕະຫຼາດຟຣີແລນຊ໌",
    "Find the": "ຊອກຫາ",
    "Right Freelancer": "ຟຣີແລນຊ໌ທີ່ເໝາະສົມ",
    "for Your Project": "ສຳລັບໂຄງການຂອງທ່ານ",
    "MEEJOB helps clients connect with talented freelancers, communicate easily, and build projects together.":
      "MEEJOB ຊ່ວຍໃຫ້ຜູ້ຈ້າງເຊື່ອມຕໍ່ກັບຟຣີແລນຊ໌ທີ່ມີຄວາມສາມາດ, ສື່ສານໄດ້ງ່າຍ ແລະ ສ້າງໂຄງການນຳກັນ.",
    "Explore Freelancers": "ເບິ່ງຟຣີແລນຊ໌",
    "Open projects": "ໂຄງການທີ່ເປີດຮັບ",
    Free: "ຟຣີ",
    "to join & post": "ສຳລັບການສະໝັກ ແລະ ລົງປະກາດ",

    /* --- features --------------------------------------------------------- */
    "Why MEEJOB?": "ເປັນຫຍັງຕ້ອງ MEEJOB?",
    "Everything you need to connect and collaborate.":
      "ທຸກຢ່າງທີ່ທ່ານຕ້ອງການ ເພື່ອເຊື່ອມຕໍ່ ແລະ ຮ່ວມງານ.",
    "Find Talent": "ຊອກຫາຄົນເກັ່ງ",
    "Discover freelancers with different skills and experience.":
      "ຄົ້ນພົບຟຣີແລນຊ໌ທີ່ມີທັກສະ ແລະ ປະສົບການຫຼາກຫຼາຍ.",
    "Easy Communication": "ສື່ສານໄດ້ງ່າຍ",
    "Contact freelancers directly through MEEJOB messaging.":
      "ຕິດຕໍ່ຟຣີແລນຊ໌ໄດ້ໂດຍກົງ ຜ່ານລະບົບຂໍ້ຄວາມຂອງ MEEJOB.",
    "Build Projects": "ສ້າງໂຄງການ",
    "Connect with the right people and turn your ideas into projects.":
      "ເຊື່ອມຕໍ່ກັບຄົນທີ່ເໝາະສົມ ແລະ ປ່ຽນຄວາມຄິດຂອງທ່ານໃຫ້ເປັນໂຄງການ.",

    /* --- freelancers / projects ------------------------------------------- */
    "Find Freelancers": "ຊອກຫາຟຣີແລນຊ໌",
    "Search for freelancers by name, bio, or skills.":
      "ຄົ້ນຫາຟຣີແລນຊ໌ ດ້ວຍຊື່, ປະຫວັດ ຫຼື ທັກສະ.",
    "Search freelancers": "ຄົ້ນຫາຟຣີແລນຊ໌",
    "Discover projects posted by clients on MEEJOB.":
      "ຄົ້ນພົບໂຄງການທີ່ຜູ້ຈ້າງລົງປະກາດໃນ MEEJOB.",
    "+ Post a Project": "+ ລົງປະກາດໂຄງການ",
    "Log in as a client to post a project.":
      "ເຂົ້າສູ່ລະບົບເປັນຜູ້ຈ້າງ ເພື່ອລົງປະກາດໂຄງການ.",

    /* --- how it works ----------------------------------------------------- */
    "Getting started with MEEJOB is simple.":
      "ການເລີ່ມຕົ້ນໃຊ້ MEEJOB ງ່າຍດາຍ.",
    "1. Create Your Profile": "1. ສ້າງໂປຣໄຟລ໌ຂອງທ່ານ",
    "Sign up and tell the MEEJOB community about yourself.":
      "ລົງທະບຽນ ແລະ ແບ່ງປັນກ່ຽວກັບຕົວທ່ານໃຫ້ຊຸມຊົນ MEEJOB.",
    "2. Find Someone": "2. ຊອກຫາຄົນທີ່ເໝາະສົມ",
    "Search freelancers and view their profiles and skills.":
      "ຄົ້ນຫາຟຣີແລນຊ໌ ແລະ ເບິ່ງໂປຣໄຟລ໌ ກັບ ທັກສະຂອງເຂົາເຈົ້າ.",
    "3. Start a Conversation": "3. ເລີ່ມການສົນທະນາ",
    "Send a message and discuss your project directly.":
      "ສົ່ງຂໍ້ຄວາມ ແລະ ປຶກສາໂຄງການຂອງທ່ານໄດ້ໂດຍກົງ.",

    /* --- about / CTA / footer -------------------------------------------- */
    "About MEEJOB": "ກ່ຽວກັບ MEEJOB",
    "MEEJOB is a freelancer marketplace designed to make it easier for clients and freelancers to discover each other, communicate, and work together.":
      "MEEJOB ເປັນຕະຫຼາດຟຣີແລນຊ໌ທີ່ຖືກອອກແບບມາ ເພື່ອໃຫ້ຜູ້ຈ້າງ ແລະ ຟຣີແລນຊ໌ ຄົ້ນພົບກັນ, ສື່ສານ ແລະ ຮ່ວມງານນຳກັນໄດ້ງ່າຍຂຶ້ນ.",
    "Ready to Build Something?": "ພ້ອມທີ່ຈະສ້າງສິ່ງໃໝ່ແລ້ວບໍ?",
    "Create your MEEJOB account and start connecting.":
      "ສ້າງບັນຊີ MEEJOB ຂອງທ່ານ ແລະ ເລີ່ມເຊື່ອມຕໍ່.",
    "A simple place for clients and freelancers to find each other, talk about the work, and get it done.":
      "ບ່ອນງ່າຍໆ ສຳລັບຜູ້ຈ້າງ ແລະ ຟຣີແລນຊ໌ ໃຫ້ພົບກັນ, ລົມກັນເລື່ອງວຽກ ແລະ ເຮັດໃຫ້ສຳເລັດ.",
    Explore: "ສຳຫຼວດ",
    "Find freelancers": "ຊອກຫາຟຣີແລນຊ໌",
    "Browse projects": "ເບິ່ງໂຄງການ",
    "How it works": "ວິທີໃຊ້ງານ",
    Account: "ບັນຊີ",
    "Create account": "ສ້າງບັນຊີ",
    "MEEJOB. All rights reserved.":
      "MEEJOB. ສະຫງວນລິຂະສິດທັງໝົດ.",
    "Built with HTML, CSS, JavaScript & Supabase.":
      "ສ້າງດ້ວຍ HTML, CSS, JavaScript ແລະ Supabase.",
    "Questions? Email us.":
      "ມີຄຳຖາມ? ສົ່ງອີເມວຫາພວກເຮົາ.",

    /* --- auth ------------------------------------------------------------- */
    "Create Your Account": "ສ້າງບັນຊີຂອງທ່ານ",
    Name: "ຊື່",
    "I am a": "ຂ້ອຍເປັນ",
    "Client — I want to hire": "ຜູ້ຈ້າງ — ຂ້ອຍຕ້ອງການຈ້າງຄົນ",
    "Freelancer — I want to work": "ຟຣີແລນຊ໌ — ຂ້ອຍຕ້ອງການຮັບງານ",
    Email: "ອີເມວ",
    Password: "ລະຫັດຜ່ານ",
    "Forgot password?": "ລືມລະຫັດຜ່ານ?",
    "Don't have an account?": "ຍັງບໍ່ມີບັນຊີ?",
    "Already have an account?": "ມີບັນຊີແລ້ວ?",
    "Sign Up": "ລົງທະບຽນ",
    "Set a New Password": "ຕັ້ງລະຫັດຜ່ານໃໝ່",
    "Choose a new password for your MEEJOB account.":
      "ເລືອກລະຫັດຜ່ານໃໝ່ ສຳລັບບັນຊີ MEEJOB ຂອງທ່ານ.",
    "New password": "ລະຫັດຜ່ານໃໝ່",
    "Confirm password": "ຢືນຢັນລະຫັດຜ່ານ",
    "Save Password": "ບັນທຶກລະຫັດຜ່ານ",
    Cancel: "ຍົກເລີກ",

    /* --- profile / projects ---------------------------------------------- */
    "Your Profile": "ໂປຣໄຟລ໌ຂອງທ່ານ",
    Role: "ບົດບາດ",
    Client: "ຜູ້ຈ້າງ",
    Freelancer: "ຟຣີແລນຊ໌",
    Bio: "ປະຫວັດຫຍໍ້",
    Skills: "ທັກສະ",
    "Separate skills with commas.": "ແຍກທັກສະດ້ວຍເຄື່ອງໝາຍຈຸດ ( , )",
    "Save Profile": "ບັນທຶກໂປຣໄຟລ໌",
    Logout: "ອອກຈາກລະບົບ",
    "Post a Project": "ລົງປະກາດໂຄງການ",
    "Project Title": "ຊື່ໂຄງການ",
    "Project Description": "ລາຍລະອຽດໂຄງການ",
    "Budget (USD)": "ງົບປະມານ (USD)",
    "Post Project": "ລົງປະກາດ",
    "Edit Project": "ແກ້ໄຂໂຄງການ",
    "Save Changes": "ບັນທຶກການປ່ຽນແປງ",
    "Loading project...": "ກຳລັງໂຫຼດໂຄງການ...",
    "Posted projects": "ໂຄງການທີ່ລົງປະກາດ",
    "My applications": "ການສະໝັກຂອງຂ້ອຍ",
    "+ New project": "+ ໂຄງການໃໝ່",
    "Loading...": "ກຳລັງໂຫຼດ...",
    Applicants: "ຜູ້ສະໝັກ",
    "Loading applicants...": "ກຳລັງໂຫຼດຜູ້ສະໝັກ...",

    /* --- messages --------------------------------------------------------- */
    Messages: "ຂໍ້ຄວາມ",
    "Loading conversations...": "ກຳລັງໂຫຼດການສົນທະນາ...",
    Chat: "ແຊັດ",
    "MEEJOB Messages": "ຂໍ້ຄວາມ MEEJOB",
    "Loading messages...": "ກຳລັງໂຫຼດຂໍ້ຄວາມ...",
    Message: "ຂໍ້ຄວາມ",
    Send: "ສົ່ງ",

    /* --- messages written by app.js --------------------------------------- */
    "Application submitted successfully.": "ສົ່ງການສະໝັກສຳເລັດແລ້ວ.",
    "Apply Now": "ສະໝັກດຽວນີ້",
    "Applying...": "ກຳລັງສະໝັກ...",
    "Login successful.": "ເຂົ້າສູ່ລະບົບສຳເລັດ.",
    "Something went wrong.": "ມີບາງຢ່າງຜິດພາດ.",
    "Invalid login credentials": "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ.",
    "Invalid email or password": "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ.",
    "Email not confirmed": "ກະລຸນາຢືນຢັນອີເມວຂອງທ່ານກ່ອນ.",
    "User already registered": "ອີເມວນີ້ລົງທະບຽນແລ້ວ.",
    "Password should be at least 6 characters":
      "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ.",
    "Signups not allowed for this instance":
      "ການລົງທະບຽນບໍ່ໄດ້ເປີດໃນລະບົບນີ້.",
    "Email address not authorized": "ອີເມວນີ້ບໍ່ໄດ້ຮັບອະນຸຍາດ.",
    "Too many requests": "ມີການຮ້ອງຂໍຫຼາຍເກີນໄປ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.",
    "Email rate limit exceeded":
      "ສົ່ງອີເມວຫຼາຍເກີນໄປ. ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.",
    "Failed to fetch": "ເຊື່ອມຕໍ່ບໍ່ສຳເລັດ. ກະລຸນາກວດອິນເຕີເນັດ.",
    "Network request failed": "ເຊື່ອມຕໍ່ບໍ່ສຳເລັດ. ກະລຸນາກວດອິນເຕີເນັດ.",
    "New password should be different from the old password.":
      "ລະຫັດຜ່ານໃໝ່ຕ້ອງຕ່າງຈາກລະຫັດເກົ່າ.",
    "Auth session missing!": "ໝົດເວລາເຂົ້າສູ່ລະບົບ. ກະລຸນາເຂົ້າສູ່ລະບົບຄືນ.",
    "Name cannot be empty.": "ຊື່ຕ້ອງບໍ່ຫວ່າງເປົ່າ.",
    "Only the project owner can edit it.":
      "ສະເພາະເຈົ້າຂອງໂຄງການຈຶ່ງແກ້ໄຂໄດ້.",
    "Only the project owner can review applicants.":
      "ສະເພາະເຈົ້າຂອງໂຄງການຈຶ່ງເບິ່ງຜູ້ສະໝັກໄດ້.",
    "Only the site owner can add job links.":
      "ສະເພາະເຈົ້າຂອງເວັບຈຶ່ງເພີ່ມລິ້ງວຽກໄດ້.",
    "Password updated. You can log in now.":
      "ອັບເດດລະຫັດຜ່ານແລ້ວ. ທ່ານສາມາດເຂົ້າສູ່ລະບົບໄດ້ເລີຍ.",
    "Passwords do not match.": "ລະຫັດຜ່ານບໍ່ກົງກັນ.",
    "Please enter a job title.": "ກະລຸນາໃສ່ຊື່ວຽກ.",
    "Please enter a project description.": "ກະລຸນາໃສ່ລາຍລະອຽດໂຄງການ.",
    "Please enter a project title.": "ກະລຸນາໃສ່ຊື່ໂຄງການ.",
    "Please enter a valid budget.": "ກະລຸນາໃສ່ງົບປະມານທີ່ຖືກຕ້ອງ.",
    "Please enter a valid http(s) link.": "ກະລຸນາໃສ່ລິ້ງ http(s) ທີ່ຖືກຕ້ອງ.",
    "Please enter your email and password.": "ກະລຸນາໃສ່ອີເມວ ແລະ ລະຫັດຜ່ານ.",
    "Please enter your name.": "ກະລຸນາໃສ່ຊື່ຂອງທ່ານ.",
    "Please wait...": "ກະລຸນາລໍຖ້າ...",
    "Profile saved successfully.": "ບັນທຶກໂປຣໄຟລ໌ສຳເລັດ.",
    "Project could not be found.": "ບໍ່ພົບໂຄງການ.",
    "Job could not be found.": "ບໍ່ພົບວຽກ.",
    Published: "ເຜີຍແຜ່ແລ້ວ",
    "Published.": "ເຜີຍແຜ່ແລ້ວ.",
    "Publishing...": "ກຳລັງເຜີຍແຜ່...",
    "Reset link sent. Check your email inbox (and spam folder).":
      "ສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່ແລ້ວ. ກວດອີເມວ (ແລະ ໂຟນເດີ spam).",
    "Saving...": "ກຳລັງບັນທຶກ...",
    "Sending reset link...": "ກຳລັງສົ່ງລິ້ງ...",
    "Submitting your application...": "ກຳລັງສົ່ງໃບສະໝັກ...",
    "Type your email address above, then click Forgot password.":
      "ພິມອີເມວຂອງທ່ານຂ້າງເທິງ ແລ້ວກົດ 'ລືມລະຫັດຜ່ານ'.",
    "Use at least 6 characters.": "ໃຊ້ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ.",
    "You have already applied to this project.":
      "ທ່ານສະໝັກໂຄງການນີ້ແລ້ວ.",

    /* --- category labels -------------------------------------------------- */
    All: "ທັງໝົດ",
    "Web development": "ພັດທະນາເວັບ",
    "Web design": "ອອກແບບເວັບ",
    "E-commerce": "ອີຄອມເມີສ",
    Design: "ອອກແບບ",
    Content: "ເນື້ອຫາ",
    "Content writing": "ຂຽນເນື້ອຫາ",
    "Video editing": "ຕັດຕໍ່ວິດີໂອ",
    Photography: "ຖ່າຍຮູບ",
    Debugging: "ແກ້ໄຂບັກ",
    Frontend: "ຟຣອນເອັນ",
    "Graphic design": "ອອກແບບກຣາຟິກ",
    "UI/UX design": "ອອກແບບ UI/UX",
    "Web hosting": "ໂຮສຕິ້ງ",
    "Lao jobs": "ວຽກລາວ",
    WordPress: "WordPress",
    Other: "ອື່ນໆ",

    /* --- categories / job types ------------------------------------------ */
    Categories: "ໝວດໝູ່",
    "Job categories": "ໝວດໝູ່ວຽກ",
    "Job category": "ໝວດໝູ່ວຽກ",
    "Job type": "ປະເພດວຽກ",
    "Job title": "ຊື່ວຽກ",
    Company: "ບໍລິສັດ",
    Location: "ສະຖານທີ່",
    "Post a Job": "ລົງປະກາດວຽກ",
    "Post a job": "ລົງປະກາດວຽກ",
    "+ Post a job": "+ ລົງປະກາດວຽກ",
    "Publish job": "ເຜີຍແຜ່ວຽກ",
    "Submit for approval": "ສົ່ງເພື່ອອະນຸມັດ",
    "Every job is reviewed before it appears publicly. Please avoid rude or abusive language.":
      "ທຸກວຽກຈະຖືກກວດກ່ອນສະແດງໃຫ້ເຫັນ. ກະລຸນາຫຼີກລ້ຽງຄຳຫຍາບຄາຍ ຫຼື ຄຳທີ່ບໍ່ສຸພາບ.",
    "Contact email or phone": "ອີເມວ ຫຼື ເບີໂທຕິດຕໍ່",
    "This contact is shown publicly with the approved job. Use a business email or phone if possible.":
      "ຂໍ້ມູນຕິດຕໍ່ນີ້ຈະສະແດງສາທາລະນະກັບວຽກທີ່ອະນຸມັດແລ້ວ. ຖ້າເປັນໄປໄດ້ ໃຫ້ໃຊ້ອີເມວທຸລະກິດ ຫຼື ເບີໂທ.",
    "Job description": "ລາຍລະອຽດວຽກ",
    "e.g. Web Developer": "ເຊັ່ນ: ນັກພັດທະນາເວັບ",
    "e.g. Digital Lao Co., Ltd.": "ເຊັ່ນ: ບໍລິສັດ ດີຈິຕອນລາວ",
    "e.g. Vientiane": "ເຊັ່ນ: ວຽງຈັນ",
    "e.g. 8,000,000 – 12,000,000 LAK": "ເຊັ່ນ: 8,000,000 – 12,000,000 ກີບ",
    "e.g. hr@company.com or 020 5555 1234": "ເຊັ່ນ: hr@company.com ຫຼື 020 5555 1234",
    "Describe the role, duties and requirements...":
      "ອະທິບາຍໜ້າທີ່ ໜ້າວຽກ ແລະ ຂໍ້ກຳນົດ...",
    "Only clients can post jobs.": "ສະເພາະຜູ້ຈ້າງຈຶ່ງລົງປະກາດວຽກໄດ້.",
    "Publishing job...": "ກຳລັງເຜີຍແຜ່ວຽກ...",
    "Submitting for approval...": "ກຳລັງສົ່ງເພື່ອອະນຸມັດ...",
    "The jobs table is not set up yet. Run supabase/meejob.sql in the Supabase SQL editor.":
      "ຕາຕະລາງວຽກຍັງບໍ່ໄດ້ຕັ້ງຄ່າ. ລັນ supabase/meejob.sql ໃນ Supabase SQL editor.",
    "Job posted successfully.": "ເຜີຍແຜ່ວຽກສຳເລັດ.",
    "Job submitted for approval. It will appear after the site owner approves it.":
      "ສົ່ງວຽກເພື່ອອະນຸມັດແລ້ວ. ວຽກຈະສະແດງຫຼັງຈາກເຈົ້າຂອງເວັບອະນຸມັດ.",
    "Job text contains prohibited language. Please remove profanity and try again.":
      "ຂໍ້ຄວາມວຽກມີຄຳຕ້ອງຫ້າມ. ກະລຸນາລຶບຄຳຫຍາບຄາຍ ແລ້ວລອງໃໝ່.",
    "Only an administrator can change job approval status.":
      "ສະເພາະຜູ້ດູແລລະບົບຈຶ່ງປ່ຽນສະຖານະອະນຸມັດໄດ້.",
    "Please enter a job title.": "ກະລຸນາໃສ່ຊື່ວຽກ.",
    "Please enter a job description.": "ກະລຸນາໃສ່ລາຍລະອຽດວຽກ.",
    "Could not publish the job.": "ເຜີຍແຜ່ວຽກບໍ່ສຳເລັດ.",
    "Edit job": "ແກ້ໄຂວຽກ",
    "Job updated. It will be reviewed again if the content changed.":
      "ອັບເດດວຽກແລ້ວ. ຈະຖືກກວດຄືນຖ້າມີການປ່ຽນເນື້ອຫາ.",
    "Untitled Job": "ວຽກບໍ່ມີຊື່",
    "Poster": "ໂປສເຕີ",
    "Job poster studio": "ສະຕູດິໂອໂປສເຕີວຽກ",
    "Turn your job details into a ready-to-share poster and caption. The design is generated locally in your browser.":
      "ປ່ຽນລາຍລະອຽດວຽກໃຫ້ເປັນໂປສເຕີ ແລະ ຄຳອະທິບາຍທີ່ພ້ອມແບ່ງປັນ. ການອອກແບບສ້າງຢູ່ໃນເບຣົາເຊີຂອງທ່ານ.",
    "Template": "ແບບ",
    "Modern": "ທັນສະໄໝ",
    "Bold": "ໂດດເດັ່ນ",
    "Minimal": "ມິນິມອນ",
    "Poster language": "ພາສາໂປສເຕີ",
    "Headline": "ຫົວຂໍ້",
    "Company / location": "ບໍລິສັດ / ສະຖານທີ່",
    "Details": "ລາຍລະອຽດ",
    "Accent colour": "ສີເນັ້ນ",
    "Logo or photo (optional)": "ໂລໂກ້ ຫຼື ຮູບ (ບໍ່ບັງຄັບ)",
    "Remove photo": "ລຶບຮູບ",
    "Post caption": "ຄຳອະທິບາຍໂພສ",
    "Auto design": "ອອກແບບອັດຕະໂນມັດ",
    "Refresh caption": "ສ້າງຄຳອະທິບາຍໃໝ່",
    "Download PNG": "ດາວໂຫລດ PNG",
    "Share": "ແບ່ງປັນ",
    "Copy caption": "ຄັດລອກຄຳອະທິບາຍ",
    "Tip: true AI image generation needs an API key and a small server. This studio creates the design locally, so your job details never leave this browser.":
      "ໝາຍເຫດ: ການສ້າງຮູບດ້ວຍ AI ຕ້ອງໃຊ້ API key ແລະ ເຊີບເວີນ້ອຍໆ. ສະຕູດິໂອນີ້ອອກແບບຢູ່ໃນເບຣົາເຊີ ຂໍ້ມູນວຽກຈຶ່ງບໍ່ອອກຈາກເຄື່ອງຂອງທ່ານ.",
    "Please choose a PNG, JPG or WebP image.":
      "ກະລຸນາເລືອກຮູບ PNG, JPG ຫຼື WebP.",
    "Please choose an image smaller than 8 MB.":
      "ກະລຸນາເລືອກຮູບທີ່ມີຂະໜາດຕ່ຳກວ່າ 8 MB.",
    "Photo added to the poster.": "ເພີ່ມຮູບໃສ່ໂປສເຕີແລ້ວ.",
    "Could not read that image.": "ອ່ານຮູບນັ້ນບໍ່ໄດ້.",
    "Photo removed.": "ລຶບຮູບແລ້ວ.",
    "Could not create the image.": "ສ້າງຮູບບໍ່ສຳເລັດ.",
    "Poster downloaded.": "ດາວໂຫລດໂປສເຕີແລ້ວ.",
    "Shared.": "ແບ່ງປັນແລ້ວ.",
    "Sharing files is not supported here. The poster was downloaded and the caption copied.":
      "ການແບ່ງປັນໄຟລ໌ບໍ່ຮອງຮັບໃນເຄື່ອງນີ້. ດາວໂຫລດໂປສເຕີ ແລະ ຄັດລອກຄຳອະທິບາຍແລ້ວ.",
    "Caption copied.": "ຄັດລອກຄຳອະທິບາຍແລ້ວ.",
    "New design generated.": "ສ້າງການອອກແບບໃໝ່ແລ້ວ.",
    "All work": "ວຽກທັງໝົດ",
    "Choose the kind of work you need — from web design to engineering.":
      "ເລືອກປະເພດວຽກທີ່ທ່ານຕ້ອງການ — ຕັ້ງແຕ່ອອກແບບເວັບ ຈົນເຖິງວິສະວະກຳ.",
    "Web design": "ອອກແບບເວັບ",
    "Websites, landing pages and online stores.":
      "ເວັບໄຊທ໌, ໜ້າເວັບ ແລະ ຮ້ານອອນລາຍ.",
    "App development": "ພັດທະນາແອັບ",
    "Mobile apps for iOS and Android.": "ແອັບມືຖືສຳລັບ iOS ແລະ Android.",
    "Project work": "ວຽກໂຄງການ",
    "Planning, coordination and delivery.":
      "ວາງແຜນ, ປະສານງານ ແລະ ສົ່ງງານ.",
    Engineering: "ວິສະວະກຳ",
    "Civil, mechanical and electrical work.":
      "ວຽກກໍ່ສ້າງ, ກົນຈັກ ແລະ ໄຟຟ້າ.",
    "Logos, branding and visual identity.":
      "ໂລໂກ້, ແບຣນ ແລະ ເອກະລັກທາງສາຍຕາ.",
    "Content & writing": "ເນື້ອຫາ ແລະ ການຂຽນ",
    "Articles, scripts and social posts.":
      "ບົດຄວາມ, ສະຄຣິບ ແລະ ໂພສຕ໌.",
    Marketing: "ການຕະຫຼາດ",
    "Social media, ads and SEO.": "ໂຊຊຽລ, ໂຄສະນາ ແລະ SEO.",
    "Anything else you need done.": "ວຽກອື່ນໆທີ່ທ່ານຕ້ອງການ.",

    /* --- hero search / projects ------------------------------------------ */
    "Lao job marketplace": "ຕະຫຼາດວຽກລາວ",
    "Find work you love.": "ຊອກວຽກທີ່ທ່ານມັກ",
    "Hire people you trust.": "ຈ້າງຄົນທີ່ທ່ານໄວ້ໃຈ",
    "MEEJOB connects clients and freelancers across Laos — post work, find talent, and get things done.":
      "MEEJOB ເຊື່ອມຕໍ່ຜູ້ຈ້າງ ແລະ ຟຣີແລນຊ໌ທົ່ວລາວ — ລົງປະກາດວຽກ, ຊອກຫາຄົນເກັ່ງ ແລະ ເຮັດໃຫ້ສຳເລັດ.",
    "Search jobs, skills or people...": "ຄົ້ນຫາວຽກ, ທັກສະ ຫຼື ຄົນ...",
    "Search jobs or freelancers": "ຄົ້ນຫາວຽກ ຫຼື ຟຣີແລນຊ໌",
    Search: "ຄົ້ນຫາ",
    "Work posted by clients in Laos — pick a category and apply.":
      "ວຽກທີ່ຜູ້ຈ້າງໃນລາວລົງປະກາດ — ເລືອກໝວດແລ້ວສະໝັກໄດ້ເລີຍ.",
    "Search projects...": "ຄົ້ນຫາໂຄງການ...",
    "Search projects": "ຄົ້ນຫາໂຄງການ",
    "Filter projects by category": "ກັ່ນຕອງໂຄງການຕາມໝວດໝູ່",
    "No projects in this category yet. Try another category.":
      "ຍັງບໍ່ມີໂຄງການໃນໝວດນີ້. ລອງເບິ່ງໝວດອື່ນ.",
    "No open projects found.": "ຍັງບໍ່ມີໂຄງການທີ່ເປີດຮັບ.",
    "MEEJOB is a job marketplace for Laos. Clients post work in categories like web design, app development, project management and engineering, and freelancers apply with one click.":
      "MEEJOB ເປັນຕະຫຼາດວຽກສຳລັບລາວ. ຜູ້ຈ້າງລົງປະກາດວຽກໃນໝວດຕ່າງໆ ເຊັ່ນ ອອກແບບເວັບ, ພັດທະນາແອັບ, ບໍລິຫານໂຄງການ ແລະ ວິສະວະກຳ, ແລະ ຟຣີແລນຊ໌ສາມາດສະໝັກໄດ້ດ້ວຍການຄລິກດຽວ.",

    /* --- preview gate ----------------------------------------------------- */
    "Members only": "ສຳລັບສະມາຊິກ",
    "See what's inside MEEJOB": "ເບິ່ງພາຍໃນ MEEJOB",
    "Create a free account to view full profiles, message talent and apply.":
      "ສະໝັກບັນຊີຟຣີ ເພື່ອເບິ່ງໂປຣໄຟລ໌ເຕັມ, ສົ່ງຂໍ້ຄວາມຫາຄົນຊອກວຽກ ແລະ ສະໝັກ.",
    "Create a free account to view profiles, apply for work and send messages.":
      "ສະໝັກບັນຊີຟຣີ ເພື່ອເບິ່ງໂປຣໄຟລ໌, ສະໝັກວຽກ ແລະ ສົ່ງຂໍ້ຄວາມ.",
    "Sign up free": "ສະໝັກຟຣີ",
    "Explore first": "ສຳຫຼວດເວັບກ່ອນ",

    /* --- jobs board -------------------------------------------------------- */
    "Find Jobs": "ຊອກວຽກ",
    "Freelance Projects": "ວຽກຟຣີແລນຊ໌",
    "Freelance projects": "ວຽກຟຣີແລນຊ໌",
    Talent: "ຄົນຊອກວຽກ",
    "Talent Profiles": "ໂປຣໄຟລ໌ເຮັດວຽກ",
    "Talent profiles": "ໂປຣໄຟລ໌ເຮັດວຽກ",
    "Find jobs": "ຊອກວຽກ",
    "MEEJOB · Lao job marketplace": "MEEJOB · ຕະຫຼາດວຽກລາວ",
    "Find Work.": "ຊອກວຽກ.",
    "Build Your Future.": "ສ້າງອະນາຄົດຂອງທ່ານ.",
    "Find Work. Build Your Future.":
      "ຊອກວຽກ. ສ້າງອະນາຄົດຂອງທ່ານ.",
    "Jobs, freelance projects and talent profiles — for students, freelancers, small businesses and companies across Laos.":
      "ວຽກ, ໂຄງການຟຣີແລນຊ໌ ແລະ ໂປຣໄຟລ໌ເຮັດວຽກ — ສຳລັບນັກສຶກສາ, ຟຣີແລນຊ໌, ທຸລະກິດຂະໜາດນ້ອຍ ແລະ ບໍລິສັດທົ່ວລາວ.",
    "Search jobs, skills or companies...":
      "ຄົ້ນຫາວຽກ, ທັກສະ ຫຼື ບໍລິສັດ...",
    "Search jobs": "ຄົ້ນຫາວຽກ",
    "Browse freelance projects": "ເບິ່ງວຽກຟຣີແລນຊ໌",
    "Full-time, part-time and short-term jobs across Laos.":
      "ວຽກປະຈຳ, ວຽກພາກສ່ວນ ແລະ ວຽກລະຍະສັ້ນ ທົ່ວລາວ.",
    "Search jobs, company or location...":
      "ຄົ້ນຫາວຽກ, ບໍລິສັດ ຫຼື ສະຖານທີ່...",
    "Filter jobs by type": "ກັ່ນຕອງວຽກຕາມປະເພດ",
    "Filter jobs by category": "ກັ່ນຕອງວຽກຕາມໝວດໝູ່",
    "All jobs": "ວຽກທັງໝົດ",
    "All categories": "ທຸກໝວດໝູ່",
    "Full-time": "ປະຈຳ",
    "Part-time": "ພາກສ່ວນ",
    "Short-term": "ລະຍະສັ້ນ",
    "Loading jobs...": "ກຳລັງໂຫລດວຽກ...",
    "No jobs match your search. Try another category or job type.":
      "ບໍ່ພົບວຽກທີ່ກົງກັບການຄົ້ນຫາ. ລອງເບິ່ງໝວດ ຫຼື ປະເພດວຽກອື່ນ.",
    "No jobs posted yet.": "ຍັງບໍ່ມີວຽກທີ່ລົງປະກາດ.",
    "View job": "ເບິ່ງວຽກ",
    Sample: "ຕົວຢ່າງ",
    Negotiable: "ຕໍ່ລອງໄດ້",
    Salary: "ເງິນເດືອນ",
    Contact: "ຕິດຕໍ່",
    "Contact:": "ຕິດຕໍ່:",
    "This is a sample listing used to demonstrate the board.":
      "ນີ້ແມ່ນປະກາດຕົວຢ່າງ ເພື່ອສະແດງການເຮັດວຽກຂອງກະດານວຽກ.",
    "Clients post projects; freelancers send a quote and deliver the work.":
      "ຜູ້ຈ້າງລົງປະກາດໂຄງການ ແລະ ຟຣີແລນຊ໌ສະເໜີລາຄາ ແລະ ສົ່ງງານ.",
    "Skills, experience, portfolio and expected pay — find the right person.":
      "ທັກສະ, ປະສົບການ, ຜົນງານ ແລະ ຄ່າຈ້າງທີ່ຕ້ອງການ — ຊອກຫາຄົນທີ່ເໝາະສົມ.",
    "Search talent": "ຄົ້ນຫາຄົນຊອກວຽກ",
    "Search talent by name, skill or experience...":
      "ຄົ້ນຫາຄົນຊອກວຽກຕາມຊື່, ທັກສະ ຫຼື ປະສົບການ...",
    "Loading talent profiles...": "ກຳລັງໂຫລດໂປຣໄຟລ໌...",
    "No freelancers found.": "ບໍ່ພົບຄົນຊອກວຽກ.",
    "Could not load freelancers.": "ບໍ່ສາມາດໂຫລດຄົນຊອກວຽກໄດ້.",
    "Expected pay": "ຄ່າຈ້າງທີ່ຕ້ອງການ",
    Phone: "ເບີໂທ",
    "Phone / WhatsApp": "ເບີໂທ / WhatsApp",
    Facebook: "ເຟສບຸກ",
    Portfolio: "ຜົນງານ",
    "Portfolio or CV link": "ລິ້ງຜົນງານ ຫຼື CV",
    "Shown on your talent profile. Leave empty to hide.":
      "ສະແດງໃນໂປຣໄຟລ໌ເຮັດວຽກຂອງທ່ານ. ປ່ອຍຫວ່າງໄວ້ເພື່ອເຊື່ອງ.",
    "Three ways to move your career or your business forward.":
      "ສາມວິທີທີ່ຈະເດີນໜ້າອາຊີບ ຫຼື ທຸລະກິດຂອງທ່ານ.",
    "1. Create Your Profile": "1. ສ້າງໂປຣໄຟລ໌ຂອງທ່ານ",
    "Add your skills, experience, portfolio, expected pay and contact details.":
      "ເພີ່ມທັກສະ, ປະສົບການ, ຜົນງານ, ຄ່າຈ້າງທີ່ຕ້ອງການ ແລະ ຊ່ອງທາງຕິດຕໍ່.",
    "2. Find Jobs or Post Work": "2. ຊອກວຽກ ຫຼື ລົງປະກາດວຽກ",
    "Browse jobs and freelance projects, or post your own project as a client.":
      "ເບິ່ງວຽກ ແລະ ໂຄງການຟຣີແລນຊ໌ ຫຼື ລົງປະກາດໂຄງການຂອງທ່ານເອງ.",
    "3. Connect and Deliver": "3. ຕິດຕໍ່ ແລະ ສົ່ງງານ",
    "Message directly, agree on the work, and build your reputation.":
      "ສົ່ງຂໍ້ຄວາມໂດຍກົງ, ຕົກລົງວຽກ ແລະ ສ້າງຊື່ສຽງຂອງທ່ານ.",
    "About MEEJOB": "ກ່ຽວກັບ MEEJOB",
    "MEEJOB is a job and freelance marketplace for Laos. Find full-time, part-time and short-term jobs, post freelance projects, and show your talent profile to clients — all in Lao and English.":
      "MEEJOB ເປັນຕະຫຼາດວຽກ ແລະ ຟຣີແລນຊ໌ສຳລັບລາວ. ຊອກວຽກປະຈຳ, ພາກສ່ວນ ແລະ ລະຍະສັ້ນ, ລົງປະກາດໂຄງການຟຣີແລນຊ໌ ແລະ ສະແດງໂປຣໄຟລ໌ເຮັດວຽກໃຫ້ຜູ້ຈ້າງເຫັນ — ທັງພາສາລາວ ແລະ ອັງກິດ.",
    "Create your free MEEJOB account and start today.":
      "ສ້າງບັນຊີ MEEJOB ຟຣີ ແລະ ເລີ່ມມື້ນີ້.",
    "Find jobs, hire freelancers and build your future — in Lao and English.":
      "ຊອກວຽກ, ຈ້າງຟຣີແລນຊ໌ ແລະ ສ້າງອະນາຄົດ — ທັງພາສາລາວ ແລະ ອັງກິດ.",

    /* --- dynamic interface text (rendered by app.js) ---------------------- */
    "Skills:": "ທັກສະ:",
    "No bio available.": "ຍັງບໍ່ມີປະຫວັດ.",
    "No skills listed.": "ຍັງບໍ່ໄດ້ລະບຸທັກສະ.",
    "Unnamed Freelancer": "ຟຣີແລນຊ໌ທີ່ບໍ່ມີຊື່",
    "View Profile": "ເບິ່ງໂປຣໄຟລ໌",
    "Log In to Apply": "ເຂົ້າສູ່ລະບົບເພື່ອສະໝັກ",
    "Open": "ເປີດຮັບ",
    "In progress": "ກຳລັງດຳເນີນການ",
    "Closed": "ປິດແລ້ວ",
    "Reopen": "ເປີດຮັບໃໝ່",
    "Accept": "ຕົກລົງ",
    "Decline": "ປະຕິເສດ",
    "Pending": "ລໍຖ້າ",
    "Accepted": "ຕົກລົງແລ້ວ",
    "Declined": "ປະຕິເສດແລ້ວ",
    "Your Project": "ໂຄງການຂອງທ່ານ",
    "Already Applied": "ສະໝັກແລ້ວ",
    "View Application": "ເບິ່ງໃບສະໝັກ",
    "Open Project": "ເປີດໂຄງການ",
    "Unknown Client": "ຜູ້ຈ້າງທີ່ບໍ່ຮູ້ຈັກ",
    "Unknown User": "ຜູ້ໃຊ້ທີ່ບໍ່ຮູ້ຈັກ",
    "Untitled Project": "ໂຄງການບໍ່ມີຊື່",
    "Not specified": "ບໍ່ໄດ້ລະບຸ",
    Edit: "ແກ້ໄຂ",
    Delete: "ລຶບ",
    "No description provided.": "ບໍ່ມີລາຍລະອຽດ.",
    "No conversations yet.": "ຍັງບໍ່ມີການສົນທະນາ.",
    "No conversations found.": "ບໍ່ພົບການສົນທະນາ.",
    "Please log in to view your messages.": "ກະລຸນາເຂົ້າສູ່ລະບົບ ເພື່ອເບິ່ງຂໍ້ຄວາມ.",
    "You cannot message yourself.": "ທ່ານບໍ່ສາມາດສົ່ງຂໍ້ຄວາມຫາຕົວເອງໄດ້.",
    "User profile could not be found.": "ບໍ່ພົບໂປຣໄຟລ໌ຜູ້ໃຊ້.",
    "Freelancer profile could not be found.": "ບໍ່ພົບໂປຣໄຟລ໌ຟຣີແລນຊ໌.",
    "Account": "ບັນຊີ",
    "Dashboard": "ໜ້າຈັດການ",
    "Admin dashboard": "ໜ້າຈັດການຜູ້ດູແລ",
    "My Applications": "ການສະໝັກຂອງຂ້ອຍ",
    "My jobs": "ວຽກຂອງຂ້ອຍ",
    "Job approvals": "ອະນຸມັດວຽກ",
    "Only the site owner can review jobs.":
      "ສະເພາະເຈົ້າຂອງເວັບຈຶ່ງກວດວຽກໄດ້.",
    "No jobs waiting for approval.": "ບໍ່ມີວຽກລໍຖ້າອະນຸມັດ.",
    "Approve": "ອະນຸມັດ",
    "Reject": "ປະຕິເສດ",
    "Approve this job?": "ອະນຸມັດວຽກນີ້?",
    "Reject this job?": "ປະຕິເສດວຽກນີ້?",
    "Job approved.": "ອະນຸມັດວຽກແລ້ວ.",
    "Job rejected.": "ປະຕິເສດວຽກແລ້ວ.",
    "Could not update job approval.": "ອັບເດດການອະນຸມັດບໍ່ສຳເລັດ.",
    "Pending approval": "ລໍຖ້າອະນຸມັດ",
    "Approved": "ອະນຸມັດແລ້ວ",
    "Rejected": "ຖືກປະຕິເສດ",
    "You have not posted a job yet.": "ທ່ານຍັງບໍ່ໄດ້ລົງປະກາດວຽກ.",
    "Posted by:": "ລົງປະກາດໂດຍ:",
    "Delete this job?": "ລຶບວຽກນີ້?",
    "Job deleted.": "ລຶບວຽກແລ້ວ.",
    "Could not delete the job.": "ລຶບວຽກບໍ່ສຳເລັດ.",
    "Log out": "ອອກຈາກລະບົບ",
    "Account created. You are logged in.": "ສ້າງບັນຊີແລ້ວ. ທ່ານໄດ້ເຂົ້າສູ່ລະບົບ.",
    "Account created. Check your email to confirm your address, then log in.":
      "ສ້າງບັນຊີແລ້ວ. ກວດອີເມວເພື່ອຢືນຢັນທີ່ຢູ່ ແລ້ວເຂົ້າສູ່ລະບົບ.",
    "Posting project...": "ກຳລັງລົງປະກາດໂຄງການ...",
    "Saving changes...": "ກຳລັງບັນທຶກການແກ້ໄຂ...",
    "Project posted successfully.": "ລົງປະກາດໂຄງການສຳເລັດ.",
    "Project updated successfully.": "ແກ້ໄຂໂຄງການສຳເລັດ.",
    "Loading freelancers...": "ກຳລັງໂຫລດຄົນຊອກວຽກ...",
    "Loading projects...": "ກຳລັງໂຫລດໂຄງການ...",
    "Loading profile...": "ກຳລັງໂຫລດໂປຣໄຟລ໌...",
    "No messages yet. Start the conversation!": "ຍັງບໍ່ມີຂໍ້ຄວາມ. ເລີ່ມການສົນທະນາໄດ້ເລີຍ!",
    "You have not posted a project yet.": "ທ່ານຍັງບໍ່ໄດ້ລົງປະກາດໂຄງການ.",
    "You have not applied to any project yet.": "ທ່ານຍັງບໍ່ໄດ້ສະໝັກໂຄງການໃດໆ.",
    "No one has applied to this project yet.": "ຍັງບໍ່ມີໃຜສະໝັກໂຄງການນີ້.",
    "Only freelancers can apply to projects.": "ສະເພາະຟຣີແລນຊ໌ຈຶ່ງສະໝັກໂຄງການໄດ້.",
    "You cannot apply to your own project.": "ທ່ານບໍ່ສາມາດສະໝັກໂຄງການຂອງຕົວເອງໄດ້.",
    "Only clients can post projects.": "ສະເພາະຜູ້ຈ້າງຈຶ່ງລົງປະກາດໂຄງການໄດ້.",
    "Could not submit application.": "ສົ່ງໃບສະໝັກບໍ່ສຳເລັດ.",
    "Could not load conversations.": "ໂຫລດການສົນທະນາບໍ່ສຳເລັດ.",
    "Could not load messages.": "ໂຫລດຂໍ້ຄວາມບໍ່ສຳເລັດ.",
    "Could not send message.": "ສົ່ງຂໍ້ຄວາມບໍ່ສຳເລັດ.",
    "Could not load your dashboard.": "ໂຫລດໜ້າຈັດການບໍ່ສຳເລັດ.",
    "Could not load projects.": "ໂຫລດໂຄງການບໍ່ສຳເລັດ.",
    "Could not log out.": "ອອກຈາກລະບົບບໍ່ສຳເລັດ.",
    "Could not save profile.": "ບັນທຶກໂປຣໄຟລ໌ບໍ່ສຳເລັດ.",
    "Could not save project.": "ບັນທຶກໂຄງການບໍ່ສຳເລັດ.",
    "Could not update the project.": "ອັບເດດໂຄງການບໍ່ສຳເລັດ.",
    "Could not delete the project.": "ລຶບໂຄງການບໍ່ສຳເລັດ.",
    "Please enter a valid email address.": "ກະລຸນາໃສ່ອີເມວທີ່ຖືກຕ້ອງ.",
    "Are you sure you want to log out?": "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?",
    "Accept this application?": "ຕົກລົງໃບສະໝັກນີ້?",
    "Decline this application?": "ປະຕິເສດໃບສະໝັກນີ້?",
    "Delete this project? Applications for it will be removed too.":
      "ລຶບໂຄງການນີ້? ໃບສະໝັກທັງໝົດຂອງໂຄງການນີ້ຈະຖືກລຶບນຳ.",
    "Profile saved. Contact details need supabase/meejob.sql to be enabled.":
      "ບັນທຶກໂປຣໄຟລ໌ແລ້ວ. ຂໍ້ມູນຕິດຕໍ່ຕ້ອງລັນ supabase/meejob.sql ກ່ອນ.",
    "Profile saved. Expected pay and contact details need supabase/meejob.sql to be enabled.":
      "ບັນທຶກໂປຣໄຟລ໌ແລ້ວ. ຄ່າຈ້າງ ແລະ ຂໍ້ມູນຕິດຕໍ່ຕ້ອງລັນ supabase/meejob.sql ກ່ອນ.",
    "Profile saved. Expected pay needs supabase/meejob.sql to be enabled.":
      "ບັນທຶກໂປຣໄຟລ໌ແລ້ວ. ຄ່າຈ້າງຕ້ອງລັນ supabase/meejob.sql ກ່ອນ.",
    Budget: "ງົບປະມານ",
    Category: "ໝວດໝູ່",

    /* --- attributes ------------------------------------------------------- */
    "Main navigation": "ເມນູຫຼັກ",
    "Open menu": "ເປີດເມນູ",
    "Switch language": "ປ່ຽນພາສາ",
    "Switch to English": "ປ່ຽນເປັນພາສາອັງກິດ",
    "Search external jobs": "ຄົ້ນຫາວຽກພາຍນອກ",
    "Filter jobs by category": "ກັ່ນຕອງວຽກຕາມໝວດໝູ່",
    Close: "ປິດ",
    "Project details": "ລາຍລະອຽດໂຄງການ",
    "Freelancer profile": "ໂປຣໄຟລ໌ຟຣີແລນຊ໌",
    "Close chat": "ປິດແຊັດ",
    "Search freelancers by name, bio, or skills...":
      "ຄົ້ນຫາຟຣີແລນຊ໌ ດ້ວຍຊື່, ປະຫວັດ ຫຼື ທັກສະ...",
    "Your name": "ຊື່ຂອງທ່ານ",
    "At least 6 characters": "ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ",
    "Repeat your new password": "ພິມລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ",
    "Tell people about yourself...": "ເລົ່າເລື່ອງຕົວທ່ານໃຫ້ຄົນອື່ນຮູ້ຈັກ...",
    "e.g. 5,000,000 LAK / month or $15 / hour":
      "ເຊັ່ນ: 5,000,000 ກີບ / ເດືອນ ຫຼື $15 / ຊົ່ວໂມງ",
    "e.g. 020 5555 1234": "ເຊັ່ນ: 020 5555 1234",
    "facebook.com/yourname": "facebook.com/yourname",
    "e.g. Web Design, JavaScript, Photoshop":
      "ເຊັ່ນ: Web Design, JavaScript, Photoshop",
    "e.g. Build a modern website": "ເຊັ່ນ: ສ້າງເວັບໄຊທ໌ທັນສະໄໝ",
    "Describe what you need...": "ອະທິບາຍສິ່ງທີ່ທ່ານຕ້ອງການ...",
    "e.g. 500": "ເຊັ່ນ: 500",
    "Type your message...": "ພິມຂໍ້ຄວາມຂອງທ່ານ...",
    "e.g. WordPress site for a bakery": "ເຊັ່ນ: ເວັບ WordPress ສຳລັບຮ້ານເບເກີ",
    "e.g. Freelancer.com, Facebook group": "ເຊັ່ນ: Freelancer.com, ກຸ່ມ Facebook",
    "One or two sentences about what they need.":
      "ໜຶ່ງ ຫຼື ສອງປະໂຫຍກກ່ຽວກັບສິ່ງທີ່ເຂົາຕ້ອງການ.",
    "e.g. $150 or Negotiable": "ເຊັ່ນ: $150 ຫຼື ຕໍ່ລອງໄດ້",
    "e.g. Web development": "ເຊັ່ນ: ພັດທະນາເວັບ",
    "WordPress, CSS, PHP": "WordPress, CSS, PHP",
    "MEEJOB — Find the Right Freelancer":
      "MEEJOB — ຊອກຫາຟຣີແລນຊ໌ທີ່ເໝາະສົມ"
  };

  /* Dynamic strings ---------------------------------------------------------- */

  function translatePattern(text) {
    var match;

    // "All (21)" / "E-commerce (3)" — filter chips
    match = text.match(/^(.+?) \((\d+)\)$/);
    if (match) {
      var label = LO[match[1]];
      if (label) {
        return label + " (" + match[2] + ")";
      }
    }

    // "21 links from other platforms"
    match = text.match(/^(\d+) links? from other platforms$/);
    if (match) {
      return match[1] + " ລິ້ງຈາກແພລດຟອມອື່ນ";
    }

    // "5 of 21 links"
    match = text.match(/^(\d+) of (\d+) links$/);
    if (match) {
      return match[1] + " ຈາກ " + match[2] + " ລິ້ງ";
    }

    // "0 open" / "12 open" — category card counts
    match = text.match(/^(\d+) open$/);
    if (match) {
      return match[1] + " ງານ";
    }

    // "Job approvals (2)" — admin dashboard tab
    match = text.match(/^Job approvals \((\d+)\)$/);
    if (match) {
      return "ອະນຸມັດວຽກ (" + match[1] + ")";
    }

    // "6 of 6 jobs" — jobs toolbar note
    match = text.match(/^(\d+) of (\d+) jobs$/);
    if (match) {
      return match[1] + " ຈາກ " + match[2] + " ວຽກ";
    }

    // "Posted by: Mook test"
    match = text.match(/^Posted by: (.+)$/);
    if (match) {
      return "ລົງປະກາດໂດຍ: " + match[1];
    }

    // "Budget: $500"
    match = text.match(/^Budget: (.+)$/);
    if (match) {
      const amount =
        match[1] === "Not specified" ? "ບໍ່ໄດ້ລະບຸ" : match[1];
      return "ງົບປະມານ: " + amount;
    }

    // Chat timestamps: "now", "5m", "3h", "2d"
    if (text === "now") {
      return "ດຽວນີ້";
    }
    match = text.match(/^(\d+)m$/);
    if (match) {
      return match[1] + " ນາທີ";
    }
    match = text.match(/^(\d+)h$/);
    if (match) {
      return match[1] + " ຊົ່ວໂມງ";
    }
    match = text.match(/^(\d+)d$/);
    if (match) {
      return match[1] + " ວັນ";
    }

    // "Posted Sep 25, 2026" / "Applied Sep 25, 2026"
    match = text.match(/^Posted (.+)$/);
    if (match) {
      return "ລົງປະກາດ " + match[1];
    }
    match = text.match(/^Applied (.+)$/);
    if (match) {
      return "ສະໝັກເມື່ອ " + match[1];
    }

    // "1 applicant · 1 new" — dashboard project summary
    match = text.match(/^(\d+) applicants? · (\d+) new$/);
    if (match) {
      return match[1] + " ຜູ້ສະໝັກ · " + match[2] + " ໃໝ່";
    }
    match = text.match(/^(\d+) applicants?$/);
    if (match) {
      return match[1] + " ຜູ້ສະໝັກ";
    }

    return null;
  }

  function translateValue(text) {
    if (!text) {
      return null;
    }
    var key = String(text).replace(/\s+/g, " ").trim();
    if (!key) {
      return null;
    }
    if (Object.prototype.hasOwnProperty.call(LO, key)) {
      return LO[key];
    }
    return translatePattern(key);
  }

  /* DOM helpers -------------------------------------------------------------- */

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, TEXTAREA: 1 };

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    if (SKIP_TAGS[el.tagName]) {
      return true;
    }
    if (el.closest("[data-no-i18n]")) {
      return true;
    }
    return false;
  }

  function translateTextNode(node) {
    var parent = node.parentElement;
    if (!parent || shouldSkip(parent)) {
      return;
    }
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) {
      return;
    }

    var trimmed = raw.trim();
    var value = translateValue(trimmed);
    if (!value || value === trimmed) {
      return;
    }

    node.nodeValue = raw.replace(trimmed, value);
  }

  function skipAttributes(el) {
    if (!el || el.nodeType !== 1) {
      return true;
    }
    if (
      el.tagName === "SCRIPT" ||
      el.tagName === "STYLE" ||
      el.tagName === "NOSCRIPT" ||
      el.tagName === "CODE"
    ) {
      return true;
    }
    return !!el.closest("[data-no-i18n]");
  }

  function translateAttributes(el) {
    if (!el || el.nodeType !== 1 || skipAttributes(el)) {
      return;
    }

    ["placeholder", "aria-label", "title"].forEach(function (attr) {
      if (!el.hasAttribute(attr)) {
        return;
      }
      var current = el.getAttribute(attr);
      var value = translateValue(current);
      if (value) {
        el.setAttribute(attr, value);
      }
    });
  }

  function translateTree(root) {
    if (!root) {
      return;
    }
    if (root.nodeType === 3) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== 1 || shouldSkip(root)) {
      return;
    }

    translateAttributes(root);
    root
      .querySelectorAll("[placeholder], [aria-label], [title]")
      .forEach(translateAttributes);

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || shouldSkip(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node = walker.nextNode();
    while (node) {
      translateTextNode(node);
      node = walker.nextNode();
    }
  }

  function applyI18n() {
    if (lang !== "lo") {
      return;
    }
    document.documentElement.lang = "lo";
    translateTree(document.body);
  }

  var PAGE_TITLES = {
    en: "MEEJOB — Find Work. Build Your Future.",
    lo: "MEEJOB — ຊອກວຽກ. ສ້າງອະນາຄົດຂອງທ່ານ."
  };

  function updateToggleLabel() {
    document.title = PAGE_TITLES[lang] || document.title;
    var label = lang === "lo" ? "EN" : "ລາວ";
    document.querySelectorAll("[data-lang-toggle]").forEach(function (button) {
      button.textContent = label;
      button.setAttribute(
        "aria-label",
        lang === "lo" ? "Switch to English" : "Switch to Lao"
      );
      button.setAttribute("lang", lang === "lo" ? "en" : "lo");
    });
  }

  function setLanguage(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      /* ignore private-mode failures */
    }
    window.location.reload();
  }

  function toggleLanguage() {
    setLanguage(lang === "lo" ? "en" : "lo");
  }

  window.applyI18n = applyI18n;
  window.setLanguage = setLanguage;
  window.toggleLanguage = toggleLanguage;
  window.getLanguage = function () {
    return lang;
  };
  // Translate a single string (used for alerts and other native UI).
  window.meejobT = function (text) {
    if (text == null) {
      return "";
    }
    var raw = String(text);
    if (lang !== "lo") {
      return raw;
    }
    return translateValue(raw) || raw;
  };

  document.documentElement.lang = lang;

  function start() {
    updateToggleLabel();
    if (lang !== "lo") {
      return;
    }

    applyI18n();

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target);
          return;
        }
        mutation.addedNodes.forEach(function (node) {
          translateTree(node);
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
