"use client";

import React from "react";
import { getTasks, putTask, deleteTask, toggleTask } from "./db";
import { format, isPast, isWithinInterval, startOfWeek, endOfWeek  } from "date-fns";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  getKeyValue,
  Select,
  SelectSection,
  SelectItem,
  Spinner,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@nextui-org/react";
import { BookOpenCheck } from "lucide-react";
import { Plus } from "lucide-react";
import { ChevronRight } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { EllipsisVertical } from 'lucide-react';
import Datepicker from "tailwind-datepicker-react"

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<any>([]);
  const [description, setDescription] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [dueDate, setDueDate] = React.useState<Date | undefined>(new Date());

  const [show, setShow] = React.useState(false)
  
	const handleChange = (selectedDate: Date) => {
    setDueDate(selectedDate)
		console.log(selectedDate)
	}

	const handleClose = (state: boolean) => {
		setShow(state)
	}

  function countTasksDueThisWeek(data: any) {
    const today = new Date();
    const startOfWeekDate = startOfWeek(today);
    const endOfWeekDate = endOfWeek(today);
    return data.filter((task: any) => isWithinInterval(task.duedate, { start: startOfWeekDate, end: endOfWeekDate })).length;
  }

  function countCompleteTasks(data: any) {
    return data.filter((task: any) => task.complete).length;
  }
  
  // Function to count the number of overdue tasks
  function countOverdueTasks(data: any) {
    const today = new Date();
    return data.filter((task: any) => isPast(task.duedate) && !task.complete).length;
  }

  const subjects = [
    {
      label: "Maths",
      value: "Maths",
    },
    {
      label: "ELACS",
      value: "ELACS",
    },
    {
      label: "Business Management",
      value: "Business Management",
    },
    {
      label: "Economics",
      value: "Economics",
    }
  ];

  const options: any = {
    title: "Due Date",
    autoHide: true,
    todayBtn: false,
    theme: {
   //   background: "bg-gray-700 dark:bg-gray-800",
      todayBtn: "",
      clearBtn: "",
      icons: "",
      text: "",
      input: "",
      inputIcon: "",
      selected: "",
    },
    icons: {
      // () => ReactElement | JSX.Element
      prev: () => <span><ChevronLeft /> </span>,
      next: () => <span><ChevronRight /> </span>,
    },
    datepickerClassNames: "top-12",
    defaultDate: dueDate,
    weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    inputNameProp: "date",
    inputIdProp: "date",
    inputPlaceholderProp: "Select Date",
    inputDateFormatProp: {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  }

  async function handleDelete(id: any) {
    const response = await deleteTask(id);
    console.log(response);
    handleGetData();
  }

  
  async function handleCheck(id: number) {
    const response = await toggleTask(id);
    console.log(response);
    handleGetData();
  }

  async function handleGetData() {
    const response: any = await getTasks();
    setData(response.rows);
    console.log(response.rows);
    setIsLoading(false);
  }

  async function handleAdd() {
    const response = await putTask(description, subject, dueDate);
    console.log(response)
    if(response === "success"){
      handleGetData()
      onClose();
    }
  }

  React.useEffect(() => {
    handleGetData();
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex justify-between gap-3 items-end">
        <Chip color="warning"variant="flat" radius="sm">Due This Week: {countTasksDueThisWeek(data)}</Chip>
        <Chip color="danger" variant="flat" radius="sm">Overdue: {countOverdueTasks(data)}</Chip>
        <Chip color="success" variant="flat" radius="sm">Complete: {countCompleteTasks(data)}</Chip>
        <Button
          className="bg-foreground text-background"
          endContent={<Plus />}
          size="sm"
          onPress={onOpen}
        >
          Add New
        </Button>
        </div>
      </div>
    );
  }, []);

  return (
    <div>
      <Navbar isBordered>
        <NavbarBrand>
          <BookOpenCheck></BookOpenCheck>
          <p className="font-bold text-inherit ms-3">StudyMate</p>
        </NavbarBrand>
      </Navbar>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Task
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Description"
                  onChange={(e)=>setDescription(e.target.value)}
                  value={description}
                />
                <Select 
                label="Select a subject" 
                //className="max-w-xs"
                onChange={(e)=>setSubject(e.target.value)}
                value={subject}
                >
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </Select>
                <Datepicker options={options} onChange={handleChange} show={show} setShow={handleClose} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Discard
                </Button>
                <Button color="primary" onPress={handleAdd}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Table
        isCompact
        removeWrapper
        aria-label="Example table with custom cells, pagination and sorting"
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn>Task</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Subject</TableColumn>
          <TableColumn>Complete</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        {data ? (
          data.length > 0 ? (
            <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner label="Loading..." />}
            >
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className={item.complete ? 'text-muted-foreground line-through' : ''}>{item.description}</TableCell>
                  <TableCell className={item.complete ? 'text-muted-foreground line-through' : ''}>{item.subject}</TableCell>
                  <TableCell>
                    <Chip className="capitalize" color={item.complete ? "success" : "danger"} size="sm" variant="flat">
                  {item.complete ? "Complete" : "Incomplete"}
                </Chip>
                  </TableCell>
                  <TableCell className={item.complete ? 'text-muted-foreground line-through' : ''}>
                  {format((item.duedate), 'dd MMMM')}
                  </TableCell>
                  <TableCell>
                  <div className="relative flex justify-end items-center gap-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <EllipsisVertical className="text-default-300" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="actions">
                      <DropdownItem>View</DropdownItem>
                      <DropdownItem onClick={()=> handleCheck(item.id)}>Complete</DropdownItem>
                      <DropdownItem>Edit</DropdownItem>
                      <DropdownItem onClick={()=> handleDelete(item.id)}>Delete</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody emptyContent={"No data to display."}>{[]}</TableBody>
          )
        ) : (
          <TableBody emptyContent={"No data to display."}>{[]}</TableBody>
        )}
      </Table>
    </div>
  );
}
