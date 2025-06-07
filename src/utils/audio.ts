import { useAudioStore } from '../store/useAudioStore';

export const playMoveSound = () => {
  try {
    const volumeValue = useAudioStore.getState().getVolumeValue();
    if (volumeValue === 0) return; // 音量が0の場合は再生しない
    
    const audio = new Audio('/move.mp3');
    audio.volume = volumeValue;
    audio.play().catch(error => {
      console.log('移動音の再生に失敗しました:', error);
    });
  } catch (error) {
    console.log('移動音の初期化に失敗しました:', error);
  }
};

export const playFanfareSound = () => {
  try {
    const volumeValue = useAudioStore.getState().getVolumeValue();
    if (volumeValue === 0) return; // 音量が0の場合は再生しない
    
    const audio = new Audio('/fanfare.mp3');
    audio.volume = volumeValue;
    audio.play().catch(error => {
      console.log('ファンファーレ音の再生に失敗しました:', error);
    });
  } catch (error) {
    console.log('ファンファーレ音の初期化に失敗しました:', error);
  }
};

export const playAddTaskSound = () => {
  try {
    const volumeValue = useAudioStore.getState().getVolumeValue();
    if (volumeValue === 0) return; // 音量が0の場合は再生しない
    
    const audio = new Audio('/add-task.mp3');
    audio.volume = volumeValue;
    audio.play().catch(error => {
      console.log('タスク追加音の再生に失敗しました:', error);
    });
  } catch (error) {
    console.log('タスク追加音の初期化に失敗しました:', error);
  }
};

export const playDeleteSound = () => {
  try {
    const volumeValue = useAudioStore.getState().getVolumeValue();
    if (volumeValue === 0) return; // 音量が0の場合は再生しない
    
    const audio = new Audio('/delete.mp3');
    audio.volume = volumeValue;
    audio.play().catch(error => {
      console.log('削除音の再生に失敗しました:', error);
    });
  } catch (error) {
    console.log('削除音の初期化に失敗しました:', error);
  }
};

// 音声再生ユーティリティ
export const playSound = (soundType: string, volume: number = 0.4): void => {
  if (volume <= 0) return;

  try {
    const audio = new Audio();
    
    // 8-bit風の効果音をプログラムで生成
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 音量設定
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // 効果音の種類に応じて周波数を設定
    switch (soundType) {
      case 'slime_click':
        // スライムクリック音：ぷよぷよ感のある音
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        break;
        
      case 'level_up':
        // レベルアップ音：上昇音
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        oscillator.type = 'square';
        break;
        
      case 'hover':
        // ホバー音：短い確認音
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.type = 'triangle';
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
        
      default:
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.type = 'sine';
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch (error) {
    // AudioContext が使用できない場合は何もしない
    console.warn('Audio playback failed:', error);
  }
};

// より複雑な効果音用のヘルパー関数
export const playComplexSound = (soundType: string, volume: number = 0.4): void => {
  if (volume <= 0) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    switch (soundType) {
      case 'evolution':
        playEvolutionSound(audioContext, volume);
        break;
      case 'sparkle':
        playSparkleSound(audioContext, volume);
        break;
    }
  } catch (error) {
    console.warn('Complex audio playback failed:', error);
  }
};

const playEvolutionSound = (audioContext: AudioContext, volume: number): void => {
  // 進化音：キラキラした上昇音
  const frequencies = [220, 277, 330, 415, 523, 659, 831];
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
    gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + index * 0.1 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
    
    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.4);
  });
};

const playSparkleSound = (audioContext: AudioContext, volume: number): void => {
  // キラキラ音：高周波数の短い音
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.1);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}; 