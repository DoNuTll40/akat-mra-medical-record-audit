require("dotenv").config();
const fs = require("fs");

const manifest = {
  name: process.env.NEXT_PUBLIC_APP_FULLNAME,
  short_name: process.env.NEXT_PUBLIC_APP_SHORTNAME,
  start_url: process.env.NEXT_PUBLIC_BASE_PATH,
  display: "standalone",
  icons: [
    { 
      src: process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH + process.env.NEXT_PUBLIC_URL_APP_ICON_192
        : process.env.NEXT_PUBLIC_URL_APP_ICON_192, 
      sizes: "192x192", 
      type: "image/png", 
      purpose: "any" 
    },
    { 
      src: process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH + process.env.NEXT_PUBLIC_URL_APP_ICON_192
        : process.env.NEXT_PUBLIC_URL_APP_ICON_512, 
      sizes: "512x512", 
      type: "image/png", 
      purpose: "any" 
    },
  ],
};

fs.writeFileSync("public/manifest.json", JSON.stringify(manifest, null, 2));
console.log("manifest generated successfully!");
