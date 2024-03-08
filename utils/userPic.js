export const userPic = (gender, username) => {
  const malePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
  const femalePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
  const elsePic = `https://avatar.iran.liara.run/username?username=[${username}]`;

  if (gender === "male") {
    return malePic;
  }
  if (gender === "female") {
    return femalePic;
  }
  return elsePic;
};
