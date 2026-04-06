import React from "react";
import {
  ParticipantTile,
  ConnectionQualityIndicator,
} from "@livekit/components-react";
import type { ParticipantTileProps } from "@livekit/components-react";

export interface CustomParticipantTileProps extends ParticipantTileProps {}

export function CustomParticipantTile(props: CustomParticipantTileProps) {
  return (
    <ParticipantTile {...props}>
      <ConnectionQualityIndicator />
    </ParticipantTile>
  );
}
