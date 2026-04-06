"use client"; // Đánh dấu đây là một Client Component

import { useState, useEffect } from "react";

// Tùy chọn: Định dạng số để luôn có 2 chữ số (ví dụ: 09 thay vì 9)
const padZero = (num: number) => num.toString().padStart(2, "0");

export function RealTimeClock() {
  // 1. Sử dụng state để lưu trữ thời gian hiện tại - khởi tạo null để tránh hydration mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Sử dụng useEffect để thiết lập thời gian ban đầu và vòng lặp cập nhật
  useEffect(() => {
    // Đánh dấu component đã được mount (chỉ chạy trên client)
    setIsMounted(true);
    // Thiết lập thời gian ban đầu
    setCurrentTime(new Date());

    // Thiết lập một interval chạy mỗi 1000ms (1 giây)
    const timerId = setInterval(() => {
      // Cập nhật lại state với thời gian mới
      setCurrentTime(new Date());
    }, 1000);

    // 3. QUAN TRỌNG: Dọn dẹp interval khi component bị unmount
    // Điều này giúp tránh rò rỉ bộ nhớ (memory leak)
    return () => {
      clearInterval(timerId);
    };
  }, []); // Mảng rỗng [] đảm bảo useEffect chỉ chạy một lần khi component được mount

  // 4. Hiển thị placeholder trong quá trình hydration, sau đó hiển thị thời gian thực
  if (!isMounted || !currentTime) {
    return <div className="font-mono text-lg">--:--:--</div>;
  }

  // 5. Định dạng và hiển thị thời gian
  const hours = padZero(currentTime.getHours());
  const minutes = padZero(currentTime.getMinutes());
  const seconds = padZero(currentTime.getSeconds());

  return (
    <div className="font-mono text-lg">
      {hours}:{minutes}:{seconds}
    </div>
  );
}
