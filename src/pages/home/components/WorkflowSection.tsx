
import { workflowSteps } from '../../../mocks/features';

export default function WorkflowSection() {
  return (
    <section className="py-16 sm:py-24 bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            이렇게 <span className="text-accent-500">작동합니다</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">간단하고 직관적인 리뷰 작성 프로세스</p>
        </div>

        <div className="overflow-x-auto pb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className="w-64 sm:w-80 bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="text-xs font-bold text-accent-500 tracking-wider mb-3 sm:mb-4">
                  {step.step}
                </div>

                <div className="aspect-square rounded-xl overflow-hidden mb-4 sm:mb-6 bg-primary-50">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {index < workflowSteps.length - 1 && (
                  <div className="flex justify-end mt-4">
                    <i className="ri-arrow-right-line text-gray-400 text-xl"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
