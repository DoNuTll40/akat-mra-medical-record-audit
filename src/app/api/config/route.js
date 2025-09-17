require("dotenv").config();

export async function GET() {
  return Response.json({
    hospital: {
      name: process.env.NEXT_PUBLIC_HOSPITAL_NAME,
      shortName: process.env.NEXT_PUBLIC_HOSPITAL_SHORT_NAME,
      code: process.env.NEXT_PUBLIC_HOSPITAL_CODE,
      // address: process.env.HOSPITAL_ADDRESS,
      // phone: process.env.HOSPITAL_PHONE,
    },
    app: {
      fullName: process.env.NEXT_PUBLIC_APP_FULLNAME,
      shortName: process.env.NEXT_PUBLIC_APP_SHORTNAME,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      icon192: process.env.NEXT_PUBLIC_URL_APP_ICON_192,
      icon512: process.env.NEXT_PUBLIC_URL_APP_ICON_512,
    },
    server: {
      port: process.env.NEXT_PUBLIC_PORT,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    },
  });
}
