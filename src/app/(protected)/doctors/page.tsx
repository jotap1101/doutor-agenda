import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AddDoctorButton from "@/app/(protected)/doctors/_components/add-doctor-button";
import DoctorCard from "@/app/(protected)/doctors/_components/doctor-card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>Gerencie os médicos de sua clínica</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        {doctors.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            Nenhum médico cadastrado. Adicione um médico para começar.
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
