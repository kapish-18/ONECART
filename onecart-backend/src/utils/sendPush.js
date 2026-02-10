export async function sendPushNotification(pushToken, title, body) {
  console.log("🚀 Sending push to:", pushToken);

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    priority: "high",
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  console.log("📤 Expo push response:", JSON.stringify(data, null, 2));
}
