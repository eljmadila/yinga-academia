const fs = require('fs');
const path = require('path');

const signInFile = path.join(__dirname, 'src/components/auth/SignInForm.tsx');
let signInContent = fs.readFileSync(signInFile, 'utf8');

// Replace hardcoded role and redirect
signInContent = signInContent.replace(
  /document\.cookie = `user_role=student; path=\/; max-age=86400; SameSite=Lax`;/,
  'const userRole = data.role ? data.role.toLowerCase() : "student";\n      document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;'
);
signInContent = signInContent.replace(
  /window\.location\.href = "\/student\/dashboard";/,
  'window.location.href = userRole === "instructor" ? "/instructor/dashboard" : "/student/dashboard";'
);

// Remove Facebook button block
const fbSignInBlockRegex = /<Button variant="outline" type="button"[\s\S]*?onClick=\{\(\) => window\.location\.href = "https:\/\/www\.facebook\.com[\s\S]*?<\/Button>/;
signInContent = signInContent.replace(fbSignInBlockRegex, '');

fs.writeFileSync(signInFile, signInContent);


const signUpFile = path.join(__dirname, 'src/components/auth/SignUpForm.tsx');
let signUpContent = fs.readFileSync(signUpFile, 'utf8');

// Replace hardcoded role and redirect (if any)
signUpContent = signUpContent.replace(
  /document\.cookie = `user_role=student; path=\/; max-age=86400; SameSite=Lax`;/,
  'const userRole = data.role ? data.role.toLowerCase() : "student";\n      document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;'
);
signUpContent = signUpContent.replace(
  /window\.location\.href = "\/student\/dashboard";/,
  'window.location.href = userRole === "instructor" ? "/instructor/dashboard" : "/student/dashboard";'
);

// Remove Facebook button block
const fbSignUpBlockRegex = /<Button variant="outline" type="button"[\s\S]*?onClick=\{\(\) => window\.location\.href = "https:\/\/www\.facebook\.com[\s\S]*?<\/Button>/;
signUpContent = signUpContent.replace(fbSignUpBlockRegex, '');

fs.writeFileSync(signUpFile, signUpContent);

console.log("Updated auth forms.");
