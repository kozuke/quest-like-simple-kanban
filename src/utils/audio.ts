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