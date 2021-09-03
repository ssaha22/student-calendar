export default function formatTime(time) {
  let newTime;
  const hour = time.substring(0, 2);
  newTime = hour % 12 || 12;
  newTime += time.substring(2, 5);
  newTime += hour < 12 || parseInt(hour) === 24 ? " AM" : " PM";
  return newTime;
}
