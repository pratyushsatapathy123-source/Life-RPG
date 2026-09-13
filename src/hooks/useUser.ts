import { usePlayer } from '../contexts/PlayerContext';

export function useUser() {
  return usePlayer();
}
