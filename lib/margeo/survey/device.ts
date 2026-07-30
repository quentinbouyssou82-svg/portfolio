export function getDriveelyAppVersion(): string {
  return (
    process.env.NEXT_PUBLIC_DRIVEELY_APP_VERSION?.trim() ||
    process.env.DRIVEELY_APP_VERSION?.trim() ||
    "0.1.0"
  );
}

export function detectDeviceInfo(userAgent: string): {
  device: string;
  isIOS: boolean;
} {
  const ua = userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && /Mobile/i.test(ua));

  let device = "Web";
  if (isIOS) device = "iOS";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Mac OS|Macintosh/i.test(ua)) device = "macOS";
  else if (/Windows/i.test(ua)) device = "Windows";
  else if (/Linux/i.test(ua)) device = "Linux";

  return { device, isIOS };
}

export function getClientDeviceInfo(): {
  device: string;
  userAgent: string;
  isIOS: boolean;
  appVersion: string;
} {
  if (typeof navigator === "undefined") {
    return {
      device: "server",
      userAgent: "",
      isIOS: false,
      appVersion: getDriveelyAppVersion(),
    };
  }
  const userAgent = navigator.userAgent;
  const { device, isIOS } = detectDeviceInfo(userAgent);
  return {
    device,
    userAgent,
    isIOS,
    appVersion: getDriveelyAppVersion(),
  };
}
