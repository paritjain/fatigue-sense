import { SessionRecord, SessionDataPoint } from '@/types/fatigue';

export const exportSessionToCSV = (session: SessionRecord) => {
  const headers = ['Time(s)', 'Fatigue(%)', 'BlinkRate(/min)', 'EAR', 'SpeechRate(/s)', 'Pitch(Hz)', 'PERCLOS(%)', 'HeadStability(%)', 'VoiceEnergy(dB)'];
  const rows = session.dataPoints.map(d => [
    d.time,
    d.fatigueLevel,
    d.blinkRate,
    d.ear,
    d.speechRate,
    d.pitch,
    (d.perclos * 100).toFixed(1),
    (d.headStability * 100).toFixed(1),
    d.voiceEnergy,
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fatigue_session_${new Date(session.startTime).toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
