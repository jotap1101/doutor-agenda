import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { deleteDoctorAction } from "@/actions/delete-doctor";
import { upsertDoctorAction } from "@/actions/upsert-doctor";
import { medicalSpecialties } from "@/app/(protected)/doctors/_constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable } from "@/db/schema";

const formSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    specialty: z
      .string()
      .trim()
      .min(1, { message: "Especialidade é obrigatória" }),
    appointmentPrice: z
      .number()
      .min(1, { message: "Preço da consulta é obrigatório" }),
    availableFromWeekDay: z.string(),
    availableToWeekDay: z.string(),
    availableFromTime: z
      .string()
      .min(1, { message: "Hora de início é obrigatória" }),
    availableToTime: z
      .string()
      .min(1, { message: "Hora de término é obrigatória" }),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message:
        "O horário de início não pode ser anterior ao horário de término.",
      path: ["availableToTime"],
    },
  );

interface UpsertDoctorFormProps {
  doctor?: typeof doctorsTable.$inferInsert;
  onSuccess?: () => void;
}

const UpsertDoctorForm = ({ doctor, onSuccess }: UpsertDoctorFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      specialty: doctor?.specialty ?? "",
      appointmentPrice: doctor?.appointmentPriceInCents
        ? doctor.appointmentPriceInCents / 100
        : 0,
      availableFromWeekDay: doctor?.availableFromWeekDay?.toString() ?? "1",
      availableToWeekDay: doctor?.availableToWeekDay?.toString() ?? "5",
      availableFromTime: doctor?.availableFromTime ?? "",
      availableToTime: doctor?.availableToTime ?? "",
    },
  });
  const upsertDoctor = useAction(upsertDoctorAction, {
    onSuccess: () => {
      toast.success(
        doctor
          ? "Médico atualizado com sucesso!"
          : "Médico adicionado com sucesso!",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao adicionar médico.");
    },
  });
  const deleteDoctor = useAction(deleteDoctorAction, {
    onSuccess: () => {
      toast.success("Médico excluído com sucesso!");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao excluir médico.");
    },
  });

  const handleDeleteDoctorClick = () => {
    if (!doctor?.id) return;
    deleteDoctor.execute({ id: doctor.id });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertDoctor.execute({
      ...values,
      id: doctor?.id,
      appointmentPriceInCents: values.appointmentPrice * 100,
      availableFromWeekDay: parseInt(values.availableFromWeekDay),
      availableToWeekDay: parseInt(values.availableToWeekDay),
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DialogHeader>
            <DialogTitle>
              {doctor ? doctor.name : "Adicionar Médico"}
            </DialogTitle>
            <DialogDescription>
              {doctor
                ? "Edite as informações do médico."
                : "Preencha os dados do novo médico."}
            </DialogDescription>
          </DialogHeader>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do médico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {medicalSpecialties.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    value={field.value}
                    onValueChange={(value) => field.onChange(value.floatValue)}
                    decimalScale={2}
                    fixedDecimalScale
                    decimalSeparator=","
                    allowNegative={false}
                    allowLeadingZeros={false}
                    thousandSeparator="."
                    customInput={Input}
                    prefix="R$ "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availableFromWeekDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia inicial de disponibilidade</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(7).keys()].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {
                            [
                              "Domingo",
                              "Segunda",
                              "Terça",
                              "Quarta",
                              "Quinta",
                              "Sexta",
                              "Sábado",
                            ][day]
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availableToWeekDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia final de disponibilidade</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(7).keys()].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {
                            [
                              "Domingo",
                              "Segunda",
                              "Terça",
                              "Quarta",
                              "Quinta",
                              "Sexta",
                              "Sábado",
                            ][day]
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availableFromTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora inicial de disponibilidade</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Manhã</SelectLabel>
                        {Array.from({ length: 16 }, (_, i) => {
                          const hour = 5 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Tarde</SelectLabel>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = 13 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Noite</SelectLabel>
                        {Array.from({ length: 10 }, (_, i) => {
                          const hour = 19 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availableToTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora final de disponibilidade</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Manhã</SelectLabel>
                        {Array.from({ length: 16 }, (_, i) => {
                          const hour = 5 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Tarde</SelectLabel>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = 13 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Noite</SelectLabel>
                        {Array.from({ length: 10 }, (_, i) => {
                          const hour = 19 + Math.floor(i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const value = `${hour.toString().padStart(2, "0")}:${minute}:00`;
                          return (
                            <SelectItem key={value} value={value}>
                              {`${hour.toString().padStart(2, "0")}:${minute}`}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {doctor && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <TrashIcon />
                    Excluir médico
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja excluir este médico?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente o médico e todos os seus dados associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteDoctorClick}>
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" disabled={upsertDoctor.isPending}>
              {upsertDoctor.isPending
                ? "Salvando..."
                : doctor
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertDoctorForm;
