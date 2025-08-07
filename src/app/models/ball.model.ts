export interface PaperBall {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  fromPlayer: number;
  progress: number;
  isVisible: boolean;
  impacting?: boolean; // novo
}
