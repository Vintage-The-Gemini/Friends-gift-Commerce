// src/components/home/FeaturesSection.jsx
const features = [
    {
      title: 'Easy Event Creation',
      description: 'Create and share your event in minutes',
      icon: '🎉'
    },
    {
      title: 'Secure Payments',
      description: 'Multiple payment options with secure processing',
      icon: '🔒'
    },
    {
      title: 'Group Gifting',
      description: 'Let friends contribute together for bigger gifts',
      icon: '🎁'
    }
  ];
  
  const FeaturesSection = () => {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Why Choose Friends Gift
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#5551FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default FeaturesSection;