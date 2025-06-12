// Debug utility to track component renders
export const logRender = (componentName: string, props?: any) => {
  if (import.meta.env.DEV) {
    console.log(`🔄 ${componentName} rendered`, {
      timestamp: new Date().toISOString(),
      props: props ? Object.keys(props) : 'no props'
    });
  }
};

export const logEffect = (componentName: string, effectName: string, dependencies?: any[]) => {
  if (import.meta.env.DEV) {
    console.log(`⚡ ${componentName} - ${effectName} effect`, {
      timestamp: new Date().toISOString(),
      dependencies: dependencies?.length || 0
    });
  }
};

export const logMount = (componentName: string) => {
  if (import.meta.env.DEV) {
    console.log(`🏗️ ${componentName} mounted`, {
      timestamp: new Date().toISOString()
    });
  }
};

export const logUnmount = (componentName: string) => {
  if (import.meta.env.DEV) {
    console.log(`🧹 ${componentName} unmounted`, {
      timestamp: new Date().toISOString()
    });
  }
};
