import React, {useEffect, useRef, useState} from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
// This simulation implements the game-theoretic models described in:
// - game_theory_ethics.md: "Perverse Incentives and Institutional Capture"
// - social_truth_proposal.md: Section 3.3 on "Structural Resilience"
// For technical implementation details, see game_theory_ethics.md#technical-specifications


const InstitutionalCollapseSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [parameters, setParameters] = useState({
    populationSize: 1000,
    existentialFear: 0.1,
    institutionalHealth: 1.0,
    selectionPressure: 0.05,
    mutationRate: 0.01,
    cooperatorAdvantage: 0.8,
    psychopathAdvantage: 1.2,
    competitorAdvantage: 1.0,
    // New technical parameters
    fearAmplification: 0.8,
    institutionalResistance: 0.3,
    positiveFeedback: 0.5,
    decayRate: 0.6,
    repairRate: 0.2
  });
  
  const intervalRef = useRef(null);
  const populationRef = useRef(null);
  const metricsRef = useRef([]);

  // Agent types with different strategies
  const AGENT_TYPES = {
    COOPERATOR: 'cooperator',      // Builds institutions, follows norms
    COMPETITOR: 'competitor',       // Competitive but rule-following
    PSYCHOPATH: 'psychopath'       // Exploits others, breaks norms
  };
  // Track phase transition metrics
  const calculatePhaseMetrics = (population) => {
    const leaders = population.filter(agent => agent.institutionalPosition > 0.7);
    const psychopathLeaders = leaders.filter(agent => agent.type === AGENT_TYPES.PSYCHOPATH).length;
    const psychopathRatio = leaders.length > 0 ? psychopathLeaders / leaders.length : 0;
    const totalPsychopaths = population.filter(agent => agent.type === AGENT_TYPES.PSYCHOPATH).length;
    const psychopathFraction = totalPsychopaths / population.length;
    return {
      leadershipPsychopathRatio: psychopathRatio,
      populationPsychopathFraction: psychopathFraction,
      phaseTransitionIndicator: psychopathRatio * parameters.existentialFear
    };
  };


  // Initialize population
  const initializePopulation = () => {
    const population = [];
    const { populationSize } = parameters;
    
    // Start with mostly cooperators (stable society)
    for (let i = 0; i < populationSize; i++) {
      let type;
      const rand = Math.random();
      if (rand < 0.7) type = AGENT_TYPES.COOPERATOR;
      else if (rand < 0.95) type = AGENT_TYPES.COMPETITOR;
      else type = AGENT_TYPES.PSYCHOPATH;
      
      population.push({
        id: i,
        type: type,
        fitness: 1.0,
        institutionalPosition: Math.random(), // 0 = bottom, 1 = top
        age: 0,
        promotions: 0,
        interactions: []
      });
    }
    
    return population;
  };

  // Calculate fitness based on interactions and environment
  const calculateFitness = (agent, population, params) => {
    let fitness = 1.0;
    const { 
      existentialFear, 
      institutionalHealth, 
      cooperatorAdvantage, 
      psychopathAdvantage, 
      competitorAdvantage,
      fearAmplification,
      positiveFeedback
    } = params;
    
    // Base fitness by type
    switch (agent.type) {
      case AGENT_TYPES.COOPERATOR:
        fitness *= cooperatorAdvantage;
        // Cooperators do better in healthy institutions
        fitness *= (0.5 + 0.5 * institutionalHealth);
        // But suffer under high existential fear (paralyzed by complexity)
        fitness *= (1 - existentialFear * 0.5);
        break;
        
      case AGENT_TYPES.COMPETITOR:
        fitness *= competitorAdvantage;
        // Stable performance regardless of conditions
        break;
        
      case AGENT_TYPES.PSYCHOPATH:
        fitness *= psychopathAdvantage;
        // Psychopaths thrive on fear and institutional decay
        fitness *= (1 + existentialFear * fearAmplification);
        fitness *= (1 + (1 - institutionalHealth) * 0.6);
        // But are less effective in very healthy institutions
        fitness *= Math.max(0.3, institutionalHealth);
        // Positive feedback from other psychopaths in power
        const psychopathMetrics = calculatePhaseMetrics(population);
        fitness *= (1 + psychopathMetrics.leadershipPsychopathRatio * positiveFeedback);
        break;
    }
    
    // Position advantage - psychopaths get exponential returns from high positions
    if (agent.type === AGENT_TYPES.PSYCHOPATH && agent.institutionalPosition > 0.7) {
      fitness *= (1 + agent.institutionalPosition * 2);
    }
    
    // Cooperators build institutional health
    if (agent.type === AGENT_TYPES.COOPERATOR && agent.institutionalPosition > 0.5) {
      fitness *= 1.2;
    }
    
    return Math.max(0.1, fitness);
  };

  // Selection and promotion within institutions
  const updateInstitutionalPositions = (population, params) => {
    const { existentialFear } = params;
    
    // Sort by current fitness for promotion decisions
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    
    // Under high fear, people prefer "strong leaders" (psychopaths)
    // Under low fear, they prefer competent builders (cooperators)
    sorted.forEach((agent, index) => {
      const promotionProbability = agent.type === AGENT_TYPES.PSYCHOPATH 
        ? existentialFear * 0.3 + 0.1
        : agent.type === AGENT_TYPES.COOPERATOR 
          ? (1 - existentialFear) * 0.2 + 0.05
          : 0.1;
      
      if (Math.random() < promotionProbability) {
        agent.institutionalPosition = Math.min(1, agent.institutionalPosition + 0.1);
        agent.promotions += 1;
      }
    });
  };

  // Calculate institutional health based on leadership composition
  const calculateInstitutionalHealth = (population) => {
    const { decayRate, repairRate } = parameters;
    const leaders = population.filter(agent => agent.institutionalPosition > 0.7);
    if (leaders.length === 0) return 0.5;
    
    const psychopathLeaders = leaders.filter(agent => agent.type === AGENT_TYPES.PSYCHOPATH).length;
    const cooperatorLeaders = leaders.filter(agent => agent.type === AGENT_TYPES.COOPERATOR).length;
    
    const psychopathRatio = psychopathLeaders / leaders.length;
    const cooperatorRatio = cooperatorLeaders / leaders.length;
    
    // Institutional health degrades exponentially with psychopath leadership
    let health = 1.0 - Math.pow(psychopathRatio, 1.5) * decayRate;
    health += cooperatorRatio * repairRate;
    
    return Math.max(0.1, Math.min(1.0, health));
  };

  // Evolution step
  const evolvePopulation = (population, params) => {
    // Calculate fitness for all agents
    population.forEach(agent => {
      agent.fitness = calculateFitness(agent, population, params);
      agent.age += 1;
    });
    
    // Update institutional positions
    updateInstitutionalPositions(population, params);
    
    // Selection and reproduction
    const newPopulation = [];
    const totalFitness = population.reduce((sum, agent) => sum + agent.fitness, 0);
    
    for (let i = 0; i < params.populationSize; i++) {
      // Fitness-proportional selection
      let selector = Math.random() * totalFitness;
      let parent = population[0];
      
      for (const agent of population) {
        selector -= agent.fitness;
        if (selector <= 0) {
          parent = agent;
          break;
        }
      }
      
      // Create offspring with possible mutation
      let childType = parent.type;
      if (Math.random() < params.mutationRate) {
        const types = Object.values(AGENT_TYPES);
        childType = types[Math.floor(Math.random() * types.length)];
      }
      
      newPopulation.push({
        id: i,
        type: childType,
        fitness: 1.0,
        institutionalPosition: Math.random() * 0.3, // New agents start low
        age: 0,
        promotions: 0,
        interactions: []
      });
    }
    
    return newPopulation;
  };

  // Run simulation step
  const simulationStep = () => {
    if (!populationRef.current) {
      populationRef.current = initializePopulation();
    }
    
    const population = populationRef.current;
    
    // Calculate current metrics
    const cooperators = population.filter(agent => agent.type === AGENT_TYPES.COOPERATOR).length;
    const competitors = population.filter(agent => agent.type === AGENT_TYPES.COMPETITOR).length;
    const psychopaths = population.filter(agent => agent.type === AGENT_TYPES.PSYCHOPATH).length;
    
    const institutionalHealth = calculateInstitutionalHealth(population);
    const phaseMetrics = calculatePhaseMetrics(population);
    
    // Update institutional health in parameters for next iteration
    parameters.institutionalHealth = institutionalHealth;
    
    // Add data point
    const newDataPoint = {
      generation: generation,
      cooperators: (cooperators / parameters.populationSize) * 100,
      competitors: (competitors / parameters.populationSize) * 100,
      psychopaths: (psychopaths / parameters.populationSize) * 100,
      institutionalHealth: institutionalHealth * 100,
      existentialFear: parameters.existentialFear * 100,
      leadershipPsychopathRatio: phaseMetrics.leadershipPsychopathRatio * 100,
      phaseTransitionIndicator: phaseMetrics.phaseTransitionIndicator * 100
    };
    
    setData(prevData => [...prevData.slice(-100), newDataPoint]);
    setGeneration(prev => prev + 1);
    // Store metrics for analysis
    metricsRef.current.push(newDataPoint);
    
    // Evolve population
    populationRef.current = evolvePopulation(population, parameters);
    
    // Dynamic fear updates (simulate external crises)
    if (generation % 50 === 0 && Math.random() < 0.3) {
      parameters.existentialFear = Math.min(1.0, parameters.existentialFear + 0.1 * Math.random());
    }
  };

  // Control simulation
  const startSimulation = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(simulationStep, 100);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    setData([]);
    setGeneration(0);
    populationRef.current = null;
    metricsRef.current = [];
    setParameters(prev => ({ ...prev, existentialFear: 0.1, institutionalHealth: 1.0 }));
  };

  const updateParameter = (key, value) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };
  // Export simulation data for analysis
  const exportData = () => {
    const dataStr = JSON.stringify({
      parameters: parameters,
      metrics: metricsRef.current,
      summary: {
        totalGenerations: generation,
        finalInstitutionalHealth: data[data.length - 1]?.institutionalHealth || 0,
        finalPsychopathFraction: data[data.length - 1]?.psychopaths || 0,
        phaseTransitionOccurred: data[data.length - 1]?.phaseTransitionIndicator > 45
      }
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `institutional_collapse_data_${Date.now()}.json`;
    a.click();
  };


  // Historical scenario presets
  const loadScenario = (scenario) => {
    stopSimulation();
    setData([]);
    setGeneration(0);
    populationRef.current = null;
    metricsRef.current = [];
    
    switch (scenario) {
      case 'weimar':
        setParameters(prev => ({
          ...prev,
          existentialFear: 0.6,
          institutionalHealth: 0.4,
          psychopathAdvantage: 1.8,
          cooperatorAdvantage: 0.6
        }));
        break;
      case 'stable':
        setParameters(prev => ({
          ...prev,
          existentialFear: 0.1,
          institutionalHealth: 0.9,
          psychopathAdvantage: 0.8,
          cooperatorAdvantage: 1.2
        }));
        break;
      case 'crisis':
        setParameters(prev => ({
          ...prev,
          existentialFear: 0.8,
          institutionalHealth: 0.3,
          psychopathAdvantage: 2.0,
          cooperatorAdvantage: 0.4
        }));
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Institutional Collapse Simulation
        </h1>
        <p className="text-gray-600 mb-4">
          Game-theoretic population dynamics modeling psychopath feedback loops in institutional decay
        </p>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={isRunning ? stopSimulation : startSimulation}
            className={`px-6 py-2 rounded font-semibold ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Stop' : 'Start'} Simulation
          </button>
          
          <button
            onClick={resetSimulation}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold"
          >
            Reset
          </button>
          <button
            onClick={exportData}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold"
          >
            Export Data
          </button>
          
          
          <div className="flex gap-2">
            <button
              onClick={() => loadScenario('stable')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              Stable Society
            </button>
            <button
              onClick={() => loadScenario('weimar')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
            >
              Weimar Crisis
            </button>
            <button
              onClick={() => loadScenario('crisis')}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              Existential Crisis
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <div className="text-2xl font-bold text-blue-800">{generation}</div>
            <div className="text-blue-600">Generation</div>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <div className="text-2xl font-bold text-green-800">
              {data.length > 0 ? Math.round(data[data.length - 1].institutionalHealth) : 100}%
            </div>
            <div className="text-green-600">Institutional Health</div>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <div className="text-2xl font-bold text-red-800">
              {Math.round(parameters.existentialFear * 100)}%
            </div>
            <div className="text-red-600">Existential Fear</div>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <div className="text-2xl font-bold text-purple-800">
              {data.length > 0 ? Math.round(data[data.length - 1].psychopaths) : 5}%
            </div>
            <div className="text-purple-600">Psychopaths</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <div className="text-2xl font-bold text-yellow-800">
              {data.length > 0 ? Math.round(data[data.length - 1].phaseTransitionIndicator) : 0}%
            </div>
            <div className="text-yellow-600">Phase Transition</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Population Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="cooperators"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                name="Cooperators %"
              />
              <Area
                type="monotone"
                dataKey="competitors"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                name="Competitors %"
              />
              <Area
                type="monotone"
                dataKey="psychopaths"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                name="Psychopaths %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">System Health Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="institutionalHealth"
                stroke="#10B981"
                strokeWidth={3}
                name="Institutional Health %"
              />
              <Line
                type="monotone"
                dataKey="existentialFear"
                stroke="#EF4444"
                strokeWidth={2}
                name="Existential Fear %"
              />
              <Line
                type="monotone"
                dataKey="leadershipPsychopathRatio"
                stroke="#9333EA"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Psychopath Leadership %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existential Fear: {(parameters.existentialFear * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={parameters.existentialFear}
              onChange={(e) => updateParameter('existentialFear', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Psychopath Advantage: {parameters.psychopathAdvantage.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={parameters.psychopathAdvantage}
              onChange={(e) => updateParameter('psychopathAdvantage', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooperator Advantage: {parameters.cooperatorAdvantage.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={parameters.cooperatorAdvantage}
              onChange={(e) => updateParameter('cooperatorAdvantage', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selection Pressure: {(parameters.selectionPressure * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={parameters.selectionPressure}
              onChange={(e) => updateParameter('selectionPressure', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mutation Rate: {(parameters.mutationRate * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={parameters.mutationRate}
              onChange={(e) => updateParameter('mutationRate', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Population Size: {parameters.populationSize}
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={parameters.populationSize}
              onChange={(e) => updateParameter('populationSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fear Amplification: {parameters.fearAmplification.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={parameters.fearAmplification}
              onChange={(e) => updateParameter('fearAmplification', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Positive Feedback: {parameters.positiveFeedback.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={parameters.positiveFeedback}
              onChange={(e) => updateParameter('positiveFeedback', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decay Rate: {parameters.decayRate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={parameters.decayRate}
              onChange={(e) => updateParameter('decayRate', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Theory Notes */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Model Theory</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Cooperators:</strong> Build institutions, follow norms, paralyzed by complex threats</p>
          <p><strong>Competitors:</strong> Rule-following but self-interested, stable performance</p>
          <p><strong>Psychopaths:</strong> Exploit others, break norms, thrive on fear and institutional decay</p>
          <p><strong>Key Insight:</strong> Existential fear creates selection pressure favoring psychopathic traits in leadership positions</p>
          <p><strong>Phase Transition:</strong> Critical threshold at ~45% fear level triggers irreversible institutional collapse</p>
          <p><strong>Hysteresis Effect:</strong> Recovery requires much lower fear levels (~30%) than initial collapse threshold</p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalCollapseSimulation;