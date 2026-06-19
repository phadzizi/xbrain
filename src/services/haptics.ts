import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function hapticCorrect(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics unavailable on web — silent no-op
  }
}

export async function hapticWrong(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Haptics unavailable on web — silent no-op
  }
}
