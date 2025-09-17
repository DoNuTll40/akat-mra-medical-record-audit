import Image from "next/image";

const imageLogo = process.env.NEXT_PUBLIC_BASE_PATH
  ? process.env.NEXT_PUBLIC_BASE_PATH + "/" + process.env.NEXT_PUBLIC_URL_APP_ICON_192
  : process.env.NEXT_PUBLIC_URL_APP_ICON_192;

export default function BrandMark() {
  return (
    <div className="flex items-center justify-center">
      <Image src={imageLogo || "/icon-192.png"} alt="Logo" width={70} height={70} />
    </div>
  );
}