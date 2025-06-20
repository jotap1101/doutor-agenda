import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";

import { medicalSpecialties } from "@/app/(protected)/doctors/_constants";
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
    availableFromWeekday: z.string(),
    availableToWeekday: z.string(),
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
      message: "Hora de início deve ser anterior à hora de término",
      path: ["availableToTime"],
    },
  );

const UpsertDoctorForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specialty: "",
      appointmentPrice: 0,
      availableFromWeekday: "1",
      availableToWeekday: "5",
      availableFromTime: "",
      availableToTime: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", values);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DialogHeader>
            <DialogTitle>Adicionar médico</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do médico que deseja adicionar à sua clínica.
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
            name="availableFromWeekday"
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
            name="availableToWeekday"
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
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertDoctorForm;
