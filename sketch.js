/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates the detectStart and detectStop API of ml5.handPose.
 */

let handPose;
let video;
let hands = [];

// 課程名稱與顏色
let courses = [
  { name: "介面設計", color: "#FF5733" },
  { name: "程式設計", color: "#33FF57" },
  { name: "攝影課", color: "#3357FF" },
  { name: "教育心理學", color: "#FF33A1" },
  { name: "2d動畫", color: "#FFC300" },
  { name: "化學課", color: "#DAF7A6" },
  { name: "物理課", color: "#C70039" },
  { name: "數學課", color: "#900C3F" },
];

let draggingIndex = -1; // 用於追蹤被移動的方塊索引
let correctYes = ["介面設計", "教育心理學", "2d動畫", "攝影課", "程式設計"]; // 正確的「是」方塊
let correctNo = ["化學課", "物理課", "數學課"]; // 正確的「否」方塊
let success = false; // 是否成功挑戰

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // 繪製文字方塊（上方課程名稱）
  let boxWidth = width / courses.length; // 每個方塊的寬度
  let boxHeight = 50; // 方塊高度
  for (let i = 0; i < courses.length; i++) {
    let x = courses[i].x || i * boxWidth; // 如果有自訂位置，使用自訂位置
    let y = courses[i].y || 0; // 如果有自訂位置，使用自訂位置
    courses[i].x = x; // 儲存位置
    courses[i].y = y;

    fill(courses[i].color);
    noStroke();
    rect(x, y, boxWidth, boxHeight); // 繪製方塊

    // 繪製文字
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(courses[i].name, x + boxWidth / 2, y + boxHeight / 2);
  }

  // 繪製下方「是」和「否」方格
  let bottomBoxWidth = width / 2; // 每個方格的寬度
  let bottomBoxHeight = 50; // 方格高度
  let bottomY = height - bottomBoxHeight; // 方格的 y 位置

  // 是方格
  fill("#4CAF50"); // 綠色
  rect(0, bottomY, bottomBoxWidth, bottomBoxHeight);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("是", bottomBoxWidth / 2, bottomY + bottomBoxHeight / 2);

  // 否方格
  fill("#F44336"); // 紅色
  rect(bottomBoxWidth, bottomY, bottomBoxWidth, bottomBoxHeight);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("否", bottomBoxWidth + bottomBoxWidth / 2, bottomY + bottomBoxHeight / 2);

  // 如果挑戰成功，顯示成功訊息
  if (success) {
    fill(0, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("已成功挑戰", width / 2, height / 2);
    return; // 停止繪製其他內容
  }

  // If there is at least one hand
  if (hands.length > 0) {
    // Find the index finger tip
    let finger = hands[0].index_finger_tip;

    // 檢查手指是否在某個方塊內
    for (let i = 0; i < courses.length; i++) {
      let x = courses[i].x;
      let y = courses[i].y;
      if (
        finger.x > x &&
        finger.x < x + boxWidth &&
        finger.y > y &&
        finger.y < y + boxHeight
      ) {
        draggingIndex = i; // 設定正在移動的方塊索引
        break;
      }
    }

    // 如果有正在移動的方塊，更新其位置
    if (draggingIndex !== -1) {
      let course = courses[draggingIndex];
      let courseX = course.x;
      let courseY = course.y;

      // 檢查是否與「是」或「否」方格重疊
      let isCollidingWithYes =
        courseX < bottomBoxWidth &&
        courseX + boxWidth > 0 &&
        courseY < bottomY + bottomBoxHeight &&
        courseY + boxHeight > bottomY;

      let isCollidingWithNo =
        courseX < width &&
        courseX + boxWidth > bottomBoxWidth &&
        courseY < bottomY + bottomBoxHeight &&
        courseY + boxHeight > bottomY;

      // 如果碰撞到「是」或「否」方格，停止移動
      if (isCollidingWithYes || isCollidingWithNo) {
        draggingIndex = -1; // 停止移動
      } else {
        // 更新方塊位置
        course.x = finger.x - boxWidth / 2;
        course.y = finger.y - boxHeight / 2;
      }

      // 檢查是否所有方塊都已碰撞到「是」或「否」方塊
      let allPlaced = courses.every((course) => {
        let courseX = course.x;
        let courseY = course.y;
        return (
          (courseX < bottomBoxWidth &&
            courseX + boxWidth > 0 &&
            courseY < bottomY + bottomBoxHeight &&
            courseY + boxHeight > bottomY) ||
          (courseX < width &&
            courseX + boxWidth > bottomBoxWidth &&
            courseY < bottomY + bottomBoxHeight &&
            courseY + boxHeight > bottomY)
        );
      });

      if (allPlaced) {
        checkAnswer(); // 檢查答案
      }
    }
  }
}

function mouseReleased() {
  // 停止移動
  draggingIndex = -1;
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}

function checkAnswer() {
  let yesCorrect = true;
  let noCorrect = true;

  // 檢查「是」方塊
  for (let i = 0; i < courses.length; i++) {
    let course = courses[i];
    let boxWidth = width / courses.length;
    let boxHeight = 50;
    let courseX = course.x;
    let courseY = course.y;
    let bottomBoxWidth = width / 2;
    let bottomBoxHeight = 50;
    let bottomY = height - bottomBoxHeight;

    // 檢查是否碰撞到「是」方塊
    if (
      courseX < bottomBoxWidth &&
      courseX + boxWidth > 0 &&
      courseY < bottomY + bottomBoxHeight &&
      courseY + boxHeight > bottomY
    ) {
      if (!correctYes.includes(course.name)) {
        yesCorrect = false; // 如果不屬於正確的「是」方塊，標記為錯誤
      }
    }

    // 檢查是否碰撞到「否」方塊
    if (
      courseX < width &&
      courseX + boxWidth > bottomBoxWidth &&
      courseY < bottomY + bottomBoxHeight &&
      courseY + boxHeight > bottomY
    ) {
      if (!correctNo.includes(course.name)) {
        noCorrect = false; // 如果不屬於正確的「否」方塊，標記為錯誤
      }
    }
  }

  // 如果所有條件都正確，顯示成功訊息，否則重置
  if (yesCorrect && noCorrect) {
    success = true; // 顯示成功訊息
  } else {
    resetCourses(); // 重置所有方塊
  }
}

function resetCourses() {
  // 重置所有方塊到初始位置
  let boxWidth = width / courses.length;
  for (let i = 0; i < courses.length; i++) {
    courses[i].x = i * boxWidth;
    courses[i].y = 0;
  }
  draggingIndex = -1;
  success = false; // 重置成功狀態
}
