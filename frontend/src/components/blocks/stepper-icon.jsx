import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Check, LoaderCircleIcon } from "lucide-react";

export default function StepperIcons({ task }) {
  // Extract dates from task data
  const createdDate = task?.created_at
    ? new Date(task.created_at).toLocaleDateString()
    : "N/A";

  const distributedDate = task?.created_at
    ? new Date(task.created_at).toLocaleDateString()
    : "N/A";

  const validatedDate = task?.task_date_validation
    ? new Date(task.task_date_validation).toLocaleDateString()
    : "Pending";

  const steps = [
    { title: "Created", description: createdDate },
    { title: "Distributed", description: distributedDate },
    { title: "Validated", description: validatedDate },
  ];

  // Determine current step based on task status
  const statusToStep = {
    not_started: 1,
    in_progress: 2,
    completed: 3,
  };

  const currentStep = statusToStep[task?.task_statut] || 1;

  return (
    <Stepper
      defaultValue={currentStep}
      indicators={{
        completed: <Check className="size-4" />,
        loading: <LoaderCircleIcon className="size-4 animate-spin" />,
      }}
      className="space-y-8"
    >
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <div className="flex flex-col gap-2.5 cursor-default">
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </div>

            {steps.length > index + 1 && (
              <StepperSeparator className="absolute top-3 inset-x-0 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none group-data-[state=completed]/step:bg-primary" />
            )}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}
