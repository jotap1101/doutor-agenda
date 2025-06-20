"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { upsertDoctorSchema } from "@/actions/upsert-doctor/schema";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

dayjs.extend(utc);

export const upsertDoctorAction = actionClient
  .inputSchema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Usuário não associado a uma clínica");
    }

    const availableFromTimeUTC = dayjs()
      .set("hour", parseInt(parsedInput.availableFromTime.split(":")[0]))
      .set("minute", parseInt(parsedInput.availableFromTime.split(":")[1]))
      .set("second", parseInt(parsedInput.availableFromTime.split(":")[2]))
      .utc();

    const availableToTimeUTC = dayjs()
      .set("hour", parseInt(parsedInput.availableToTime.split(":")[0]))
      .set("minute", parseInt(parsedInput.availableToTime.split(":")[1]))
      .set("second", parseInt(parsedInput.availableToTime.split(":")[2]))
      .utc();

    await db
      .insert(doctorsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
        availableToTime: availableToTimeUTC.format("HH:mm:ss"),
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
          availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
          availableToTime: availableToTimeUTC.format("HH:mm:ss"),
        },
      });

    revalidatePath("/doctors");
  });
