import type { WorkflowStep } from '../types';

interface WorkflowProgressProps {
  currentStep: number;
  workflowStep: WorkflowStep;
}

export function WorkflowProgress({ currentStep, workflowStep }: WorkflowProgressProps) {
  const steps = [
    { number: 1, label: 'Enter Address', active: currentStep >= 1 },
    { number: 2, label: 'Get Aerial View', active: currentStep >= 2 },
    {
      number: 3,
      label: workflowStep === 'area' ? 'Measure Roof Area' : 'Measure Capping',
      active: currentStep >= 3,
      color: workflowStep === 'area' ? 'green' : 'orange'
    },
    { number: 4, label: 'Review Cappings', active: workflowStep === 'lines' }
  ];

  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step.active
                ? step.color === 'green'
                  ? 'bg-green-500 text-white'
                  : step.color === 'orange'
                    ? 'bg-orange-500 text-white'
                    : 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 w-12 ${step.active ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
