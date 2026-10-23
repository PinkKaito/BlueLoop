import { RainDataset, rainfallAt } from './simulation';

/** Visual weather only. Storage and runoff remain the simulation's responsibility. */
export function sceneWeather(dataset: RainDataset, hour: number) {
  const rate = Math.max(0, rainfallAt(dataset, hour));
  const intensity = Math.min(1, Math.log1p(rate) / Math.log(43));
  // Integrate only elapsed rainfall, with a 1.5-hour drying time. Reconstructing
  // from the dataset makes reloads and playback speeds agree.
  let retained = 0;
  const end = Math.max(0, hour);
  for (
    let i = Math.max(0, Math.floor(end - 9));
    i < Math.min(Math.ceil(end), dataset.points.length);
    i++
  ) {
    const a = Math.max(i, end - 9);
    const b = Math.min(i + 1, end);
    if (b > a)
      retained +=
        Math.max(0, dataset.points[i].rainMm) *
        1.5 *
        (Math.exp(-(end - b) / 1.5) - Math.exp(-(end - a) / 1.5));
  }
  return {
    rate,
    intensity,
    wetness: 1 - Math.exp(-retained / 3),
    label: rate === 0 ? 'Dry' : rate < 5 ? 'Light rain' : 'Heavy rain',
  };
}
