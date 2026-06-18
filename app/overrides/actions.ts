"use server";

import { revalidatePath } from "next/cache";
import {
  setWordOverride,
  removeWordOverride,
  setVerseOverride,
  removeVerseOverride,
  setSurahOverride,
  removeSurahOverride,
} from "@/lib/supabase/overrides";

export async function setWordOverrideAction(verseKey: string, position: number, manualValue: number) {
  await setWordOverride(verseKey, position, manualValue);
  revalidatePath(`/verses/${verseKey}`);
  revalidatePath(`/surahs/${verseKey.split(":")[0]}`);
}

export async function removeWordOverrideAction(verseKey: string, position: number) {
  await removeWordOverride(verseKey, position);
  revalidatePath(`/verses/${verseKey}`);
  revalidatePath(`/surahs/${verseKey.split(":")[0]}`);
}

export async function setVerseOverrideAction(verseKey: string, manualValue: number) {
  await setVerseOverride(verseKey, manualValue);
  revalidatePath(`/verses/${verseKey}`);
  revalidatePath(`/surahs/${verseKey.split(":")[0]}`);
}

export async function removeVerseOverrideAction(verseKey: string) {
  await removeVerseOverride(verseKey);
  revalidatePath(`/verses/${verseKey}`);
  revalidatePath(`/surahs/${verseKey.split(":")[0]}`);
}

export async function setSurahOverrideAction(surahNumber: number, manualValue: number) {
  await setSurahOverride(surahNumber, manualValue);
  revalidatePath(`/surahs/${surahNumber}`);
}

export async function removeSurahOverrideAction(surahNumber: number) {
  await removeSurahOverride(surahNumber);
  revalidatePath(`/surahs/${surahNumber}`);
}
