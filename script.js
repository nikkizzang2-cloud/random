const tds = document.querySelectorAll('td');

tds.forEach(td => {
  let timeoutId;

  td.addEventListener('mouseenter', () => {
    td.classList.add('heart-active');

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  td.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
      td.classList.remove('heart-active');
      timeoutId = null;
    }, 500);   // 이 시간만큼 "그대로" 유지
  });
});


// 1) trail-dot: 마우스 움직일 때마다 작은 점 생성
document.addEventListener('mousemove', (e) => {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = `${e.clientX}px`;
  dot.style.top  = `${e.clientY}px`;
  document.body.appendChild(dot);

  setTimeout(() => {
    dot.style.opacity = '0';
    setTimeout(() => dot.remove(), 300);
  }, 50);
});




// ------------------------------
// CLICK !
// - 여러 칸이 잔상처럼 부드럽게 선택됨
//   (새로운 칸이 켜지고, 오래된 칸은 시간이 지나면 자연스럽게 꺼짐)
// - 전체적으로는 항상 일정 개수 이하만 켜져 있고
// - 마지막에는 한 칸만 남기
// ------------------------------
const startBtn = document.getElementById('start-random');
const cells = Array.from(document.querySelectorAll('td'));
let trailInterval = null;
let deletingInterval = null;
let isRunning = false;

// 한 번에 최대 몇 칸까지 켜져 있을지 (잔상 폭)
const MAX_ACTIVE = 20;   // 원하는 숫자로 조절
// 잔상이 유지되는 전체 시간 (ms)
const TRAIL_DURATION = 4500; // 3초 정도

if (startBtn) {
  startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;

    const aliveCells = cells.filter(td => td.textContent.trim() !== '');
    // 시작 시 모든 하트 끄기
    aliveCells.forEach(td => td.classList.remove('heart-active'));

    // 현재 켜져 있는 셀들을 "순서대로" 기억하는 큐
    const activeQueue = [];

    // 1단계: 부드러운 잔상처럼 계속 추가/제거
    trailInterval = setInterval(() => {
      // 1) 새 셀 하나를 랜덤으로 켜기
      const randomIndex = Math.floor(Math.random() * aliveCells.length);
      const cell = aliveCells[randomIndex];

      if (!cell.classList.contains('heart-active')) {
        cell.classList.add('heart-active');
        activeQueue.push(cell); // 가장 나중에 켜진 순서대로 뒤에 추가
      }

      // 2) 너무 많이 쌓이면 가장 오래된 것부터 꺼서 부드럽게 흘러가게
      if (activeQueue.length > MAX_ACTIVE) {
        const oldest = activeQueue.shift(); // 가장 오래된 선택
        if (oldest && oldest.classList.contains('heart-active')) {
          oldest.classList.remove('heart-active');
        }
      }
    }, 150); // 잔상 프레임 간격 (조금 부드럽게)

    // 일정 시간 후, 마지막 한 칸만 남기는 모드로 전환
    setTimeout(() => {
      clearInterval(trailInterval);

      // 전환 시점의 상태: activeQueue 안에 최근에 켜진 셀들이 들어 있음
      // 혹시 다 꺼져 있다면, 안전하게 하나는 켜두고 시작
      if (activeQueue.length === 0 && aliveCells.length > 0) {
        const one = aliveCells[Math.floor(Math.random() * aliveCells.length)];
        one.classList.add('heart-active');
        activeQueue.push(one);
      }

      startDeleting(aliveCells);
    }, TRAIL_DURATION);

    // 2단계: 현재 켜져 있는 셀들 중에서 하나씩 꺼내서 결국 한 칸만 남기
    function startDeleting(alive) {
      deletingInterval = setInterval(() => {
        const activeCells = alive.filter(td =>
          td.classList.contains('heart-active')
        );

        // 0개면 종료
        if (activeCells.length === 0) {
          clearInterval(deletingInterval);
          isRunning = false;
          return;
        }

        // 1개면 그 한 칸만 남기고 종료
        if (activeCells.length === 1) {
          clearInterval(deletingInterval);
          isRunning = false;
          return;
        }

        // 여러 개 중 "조금 더 오래된 쪽"을 우선 꺼주고 싶다면:
        // activeQueue에서 아직 켜져 있는 셀을 앞에서부터 찾기
        let target = null;
        while (activeQueue.length > 0 && !target) {
          const candidate = activeQueue.shift();
          if (candidate.classList.contains('heart-active')) {
            target = candidate;
          }
        }

        // 큐에서 못 찾으면 그냥 랜덤으로 하나 끄기
        if (!target) {
          const removeIndex = Math.floor(Math.random() * activeCells.length);
          target = activeCells[removeIndex];
        }

        target.classList.remove('heart-active');
      }, 400); // 하나씩 줄어드는 속도
    }
  });
}
