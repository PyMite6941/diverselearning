import type { Course } from "./types";

/**
 * A curated, ready-to-open library of bite-sized concept courses — the
 * "browse & learn" experience (SmartyMe-style). Unlike AI-generated courses,
 * these ship with the app: no API key, no sign-in, no waiting. They reuse the
 * exact same `Course` shape, so the existing course viewer renders them with
 * zero changes (concept content + quick-checks + optional 3D diagrams).
 *
 * IDs are stable + prefixed `cat-` so deep links keep working and never collide
 * with the random slugs used by generated courses.
 */

export interface CatalogCategory {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  courses: Course[];
}

// A fixed timestamp so catalog cards don't churn their "createdAt".
const T0 = 0;

/* ------------------------------------------------------------------ *
 *  ELECTRICAL ENGINEERING
 * ------------------------------------------------------------------ */

const electricityFundamentals: Course = {
  id: "cat-elec-fundamentals",
  title: "Electricity Fundamentals",
  subtitle: "Voltage, current, resistance, and Ohm's law — the whole foundation",
  topic: "electrical engineering",
  level: "beginner",
  accent: "#f5b301",
  createdAt: T0,
  lessons: [
    {
      id: "cat-elec-fundamentals-l0",
      title: "The Water Analogy",
      body: [
        "Electricity moves through a wire a lot like water moves through a pipe. Getting this picture right makes everything else click.",
        "Voltage is the pressure pushing the water. Current is how much water actually flows past a point each second. Resistance is how narrow the pipe is — a thin pipe fights the flow.",
        "Rotate the circuit and click any part to see its job. A source pushes charge around a loop; the loop must be complete for anything to flow.",
      ],
      model: {
        caption: "A simple circuit: a battery drives current around a loop through a resistor and lights an LED.",
        cameraPosition: [0, 0, 7],
        parts: [
          { id: "cat-elec-fundamentals-l0-p0", label: "Battery", shape: "box", position: [-2, 0, 0], scale: [0.5, 1.4, 0.6], color: "#22c55e", finish: "matte", explanation: "The source of voltage. It pushes charge out of one terminal and pulls it back into the other." },
          { id: "cat-elec-fundamentals-l0-p1", label: "Top wire", shape: "box", position: [0, 1.1, 0], scale: [3.6, 0.08, 0.08], color: "#94a3b8", finish: "metal", metalness: 1, roughness: 0.3, explanation: "A conductor. Electrons drift along it with almost no resistance." },
          { id: "cat-elec-fundamentals-l0-p2", label: "Bottom wire", shape: "box", position: [0, -1.1, 0], scale: [3.6, 0.08, 0.08], color: "#94a3b8", finish: "metal", metalness: 1, roughness: 0.3, explanation: "The return path. Current only flows when the loop is complete all the way around." },
          { id: "cat-elec-fundamentals-l0-p3", label: "Resistor", shape: "cylinder", position: [0.4, 1.1, 0], scale: [0.28, 0.9, 0.28], rotation: [0, 0, 90], color: "#d9a066", finish: "matte", explanation: "Deliberately restricts current — the 'narrow pipe'. It sets how much current flows and often protects other parts." },
          { id: "cat-elec-fundamentals-l0-p4", label: "LED", shape: "sphere", position: [2, 1.1, 0], scale: [0.32, 0.32, 0.32], color: "#f97316", finish: "glow", emissiveIntensity: 0.8, explanation: "Turns current into light. It only lights when current flows the right way around the loop." },
          { id: "cat-elec-fundamentals-l0-p5", label: "Switch", shape: "box", position: [-0.6, -1.1, 0], scale: [0.5, 0.16, 0.16], rotation: [0, 0, 20], color: "#e2e8f0", finish: "metal", explanation: "Breaks or completes the loop. Open the switch and current stops instantly everywhere." },
        ],
      },
      concept: {
        keyPoints: [
          "Voltage (volts, V) = electrical pressure — the push.",
          "Current (amps, A) = rate of charge flow — the amount moving.",
          "Resistance (ohms, Ω) = opposition to flow — the squeeze.",
          "Current only flows around a complete, unbroken loop.",
        ],
      },
      check: {
        question: "In the water analogy, what does voltage represent?",
        answer: "Pressure — the push that drives the flow. (Current is the flow itself; resistance is how narrow the pipe is.)",
      },
    },
    {
      id: "cat-elec-fundamentals-l1",
      title: "Ohm's Law",
      body: [
        "Ohm's law ties the three quantities together in one tiny equation: V = I × R.",
        "Voltage equals current times resistance. Rearranged: I = V / R and R = V / I. If you know any two, you can always find the third.",
        "This one relationship is behind almost every everyday circuit calculation, from picking a resistor to sizing a wire.",
      ],
      concept: {
        keyPoints: [
          "V = I × R  (volts = amps × ohms).",
          "I = V / R — more voltage or less resistance means more current.",
          "R = V / I — measure voltage and current to find an unknown resistance.",
        ],
        example:
          "A 9 V battery drives current through a 450 Ω resistor.\nI = V / R = 9 / 450 = 0.02 A = 20 mA.\nDouble the resistance to 900 Ω and the current halves to 10 mA — same push, narrower pipe.",
      },
      check: {
        question: "A 12 V supply pushes current through a 6 Ω resistor. What is the current?",
        answer: "I = V / R = 12 / 6 = 2 A.",
      },
    },
    {
      id: "cat-elec-fundamentals-l2",
      title: "Series vs Parallel",
      body: [
        "There are two basic ways to connect components: one after another (series), or side by side (parallel). The wiring changes everything.",
        "In series, the same current flows through every part and the voltage splits between them. Resistances add up. Break one part and the whole chain dies — like old Christmas lights.",
        "In parallel, every branch gets the full voltage and the current splits between them. Total resistance drops. One branch can fail and the others keep working — like the outlets in your house.",
      ],
      concept: {
        keyPoints: [
          "Series: same current everywhere; voltages add; resistances add (R = R₁ + R₂ + …).",
          "Parallel: same voltage across each branch; currents add; total resistance drops below the smallest branch.",
          "Series breaks all-or-nothing; parallel keeps working if one branch fails.",
        ],
        vocab: [
          { term: "Series", meaning: "Components on a single path, end to end. One current for all." },
          { term: "Parallel", meaning: "Components on separate branches sharing the same two nodes. One voltage for all." },
          { term: "Node", meaning: "A junction where wires meet. Current in equals current out." },
        ],
      },
      check: {
        question: "You wire two 100 Ω resistors in series. What is the total resistance?",
        answer: "200 Ω. In series, resistances simply add.",
      },
    },
    {
      id: "cat-elec-fundamentals-l3",
      title: "Power and Energy",
      body: [
        "Power is how fast a component uses energy, measured in watts (W). It's what makes a resistor warm, a motor spin, or a bulb glow.",
        "The core formula is P = V × I. Combine it with Ohm's law and you also get P = I²R and P = V²/R.",
        "Energy is power used over time. A 10 W device left on for an hour uses 10 watt-hours — that's what your electricity bill actually charges for.",
      ],
      concept: {
        keyPoints: [
          "Power P = V × I (watts).",
          "Also P = I²R and P = V²/R via Ohm's law.",
          "Energy = power × time; utilities bill in kilowatt-hours (kWh).",
        ],
        example:
          "An LED drops 2 V and carries 20 mA.\nP = V × I = 2 × 0.02 = 0.04 W = 40 mW.\nA 1500 W heater running 2 hours uses 1.5 kW × 2 h = 3 kWh of energy.",
      },
      check: {
        question: "A device runs at 5 V and draws 0.5 A. How much power does it use?",
        answer: "P = V × I = 5 × 0.5 = 2.5 W.",
      },
    },
  ],
};

const electronicComponents: Course = {
  id: "cat-elec-components",
  title: "Electronic Components",
  subtitle: "Resistors, capacitors, diodes and transistors — what each part actually does",
  topic: "electrical engineering",
  level: "beginner",
  accent: "#38bdf8",
  createdAt: T0,
  lessons: [
    {
      id: "cat-elec-components-l0",
      title: "The Resistor",
      body: [
        "A resistor is the most common part on any board. Its one job: limit current by adding a fixed, known resistance.",
        "The colored bands printed around the body encode its value in ohms — a base-10 code you can read off directly once you know it.",
        "Explode the model to see the ceramic body, the metal leads, and the color bands.",
      ],
      model: {
        caption: "A through-hole resistor: a ceramic body with color-code bands and two metal leads.",
        cameraPosition: [0, 0, 6],
        parts: [
          { id: "cat-elec-components-l0-p0", label: "Body", shape: "cylinder", position: [0, 0, 0], scale: [0.55, 1.5, 0.55], rotation: [0, 0, 90], color: "#d9b382", finish: "matte", explanation: "The ceramic core that provides the resistance. Its length and material set how much current it can safely handle." },
          { id: "cat-elec-components-l0-p1", label: "Left lead", shape: "cylinder", position: [-1.7, 0, 0], scale: [0.08, 1.2, 0.08], rotation: [0, 0, 90], color: "#cbd5e1", finish: "metal", metalness: 1, roughness: 0.25, explanation: "A wire lead that solders into the circuit. Resistors have no polarity — either lead can face either way." },
          { id: "cat-elec-components-l0-p2", label: "Right lead", shape: "cylinder", position: [1.7, 0, 0], scale: [0.08, 1.2, 0.08], rotation: [0, 0, 90], color: "#cbd5e1", finish: "metal", metalness: 1, roughness: 0.25, explanation: "The second lead. Current enters one lead and leaves the other." },
          { id: "cat-elec-components-l0-p3", label: "Band 1 (brown)", shape: "cylinder", position: [-0.5, 0, 0], scale: [0.58, 0.12, 0.58], rotation: [0, 0, 90], color: "#7c3f00", finish: "matte", explanation: "First digit of the value. Brown = 1." },
          { id: "cat-elec-components-l0-p4", label: "Band 2 (black)", shape: "cylinder", position: [-0.2, 0, 0], scale: [0.58, 0.12, 0.58], rotation: [0, 0, 90], color: "#111827", finish: "matte", explanation: "Second digit. Black = 0. So far the digits read '10'." },
          { id: "cat-elec-components-l0-p5", label: "Band 3 (red)", shape: "cylinder", position: [0.1, 0, 0], scale: [0.58, 0.12, 0.58], rotation: [0, 0, 90], color: "#dc2626", finish: "matte", explanation: "The multiplier. Red = ×100, giving 10 × 100 = 1000 Ω (1 kΩ)." },
          { id: "cat-elec-components-l0-p6", label: "Band 4 (gold)", shape: "cylinder", position: [0.6, 0, 0], scale: [0.58, 0.12, 0.58], rotation: [0, 0, 90], color: "#d4af37", finish: "metal", explanation: "Tolerance. Gold = ±5%, so this resistor is 1 kΩ give or take 50 Ω." },
        ],
      },
      concept: {
        keyPoints: [
          "A resistor limits current: more ohms means less current for the same voltage.",
          "Color bands encode the value — first digits, then a multiplier, then tolerance.",
          "Resistors have no polarity — they work either way round.",
        ],
      },
      check: {
        question: "Bands brown-black-red mean 10 × 100. What resistance is that?",
        answer: "1000 Ω, i.e. 1 kΩ.",
      },
    },
    {
      id: "cat-elec-components-l1",
      title: "The Capacitor",
      body: [
        "A capacitor stores energy in an electric field between two conductive plates separated by an insulator (the dielectric).",
        "It resists sudden changes in voltage: it charges up and discharges over time. That makes it perfect for smoothing bumpy power, filtering signals, and timing.",
        "Capacitance is measured in farads (F) — usually tiny fractions like microfarads (µF) or picofarads (pF).",
      ],
      model: {
        caption: "A parallel-plate capacitor: two plates with a dielectric between them, each plate wired to a lead.",
        cameraPosition: [0, 0, 6],
        parts: [
          { id: "cat-elec-components-l1-p0", label: "Plate A", shape: "box", position: [-0.5, 0, 0], scale: [0.12, 1.6, 1.6], color: "#f97316", finish: "metal", metalness: 1, roughness: 0.3, explanation: "One conductive plate. Positive charge piles up here as the capacitor charges." },
          { id: "cat-elec-components-l1-p1", label: "Plate B", shape: "box", position: [0.5, 0, 0], scale: [0.12, 1.6, 1.6], color: "#38bdf8", finish: "metal", metalness: 1, roughness: 0.3, explanation: "The other plate. Equal and opposite charge builds up here." },
          { id: "cat-elec-components-l1-p2", label: "Dielectric", shape: "box", position: [0, 0, 0], scale: [0.85, 1.5, 1.5], color: "#a78bfa", opacity: 0.35, finish: "glass", explanation: "The insulator between the plates. It stops charge from crossing while letting the electric field store energy." },
          { id: "cat-elec-components-l1-p3", label: "Lead A", shape: "cylinder", position: [-0.5, -1.4, 0], scale: [0.07, 1.2, 0.07], color: "#cbd5e1", finish: "metal", explanation: "Connects plate A to the circuit." },
          { id: "cat-elec-components-l1-p4", label: "Lead B", shape: "cylinder", position: [0.5, -1.4, 0], scale: [0.07, 1.2, 0.07], color: "#cbd5e1", finish: "metal", explanation: "Connects plate B. Some capacitors are polarized — the leads must go the right way round." },
        ],
      },
      concept: {
        keyPoints: [
          "Stores energy in the electric field between two plates.",
          "Resists sudden voltage change: charges and discharges over time.",
          "Used for smoothing power supplies, filtering, and timing circuits.",
        ],
        vocab: [
          { term: "Dielectric", meaning: "The insulating layer between the plates that lets the field store energy." },
          { term: "Farad (F)", meaning: "The unit of capacitance — how much charge is stored per volt." },
        ],
      },
      check: {
        question: "What does a capacitor store energy in?",
        answer: "An electric field between its two plates (across the dielectric).",
      },
    },
    {
      id: "cat-elec-components-l2",
      title: "Diodes and LEDs",
      body: [
        "A diode is a one-way valve for current: it lets charge flow in one direction and blocks it in the other.",
        "That makes diodes essential for converting AC to DC (rectification) and for protecting circuits from reversed batteries.",
        "An LED is a diode that emits light when current flows the correct way. Because it drops a fixed voltage, you almost always pair it with a series resistor to limit current.",
      ],
      concept: {
        keyPoints: [
          "A diode conducts one way (forward) and blocks the other (reverse).",
          "It has polarity: the anode (+) and cathode (−) are not interchangeable.",
          "An LED lights when forward-biased — always add a series resistor to cap the current.",
        ],
        vocab: [
          { term: "Forward bias", meaning: "Voltage applied the way the diode conducts — current flows." },
          { term: "Reverse bias", meaning: "Voltage the other way — the diode blocks current." },
          { term: "Rectifier", meaning: "A diode arrangement that turns alternating current into direct current." },
        ],
        example:
          "Driving an LED from 5 V: the LED drops ~2 V and wants ~20 mA.\nResistor voltage = 5 − 2 = 3 V, so R = V / I = 3 / 0.02 = 150 Ω in series.",
      },
      check: {
        question: "Why do you put a resistor in series with an LED?",
        answer: "To limit the current — without it the LED would draw too much and burn out.",
      },
    },
    {
      id: "cat-elec-components-l3",
      title: "The Transistor",
      body: [
        "The transistor is the component that built the modern world — billions of them sit inside every chip.",
        "It does two things: it acts as a switch (a small signal turns a large current on or off), and as an amplifier (a small change controls a much bigger one).",
        "A tiny current or voltage at the control terminal governs the flow between the other two. Wire millions together and you get logic gates, memory, and processors.",
      ],
      concept: {
        keyPoints: [
          "A transistor is an electrically controlled switch and amplifier.",
          "A small signal on the control pin (base/gate) governs a large current between the other two.",
          "Chained together, transistors form the logic gates that make up all computers.",
        ],
        vocab: [
          { term: "BJT", meaning: "Bipolar junction transistor — controlled by a small base current. Pins: base, collector, emitter." },
          { term: "MOSFET", meaning: "Controlled by a gate voltage (almost no current). Dominates digital chips. Pins: gate, drain, source." },
          { term: "Gain", meaning: "How much the transistor multiplies its control signal when amplifying." },
        ],
      },
      check: {
        question: "What are the two main jobs a transistor can do?",
        answer: "Switching (turn a larger current on/off) and amplifying (let a small signal control a bigger one).",
      },
    },
  ],
};

const digitalLogic: Course = {
  id: "cat-elec-digital-logic",
  title: "Digital Logic",
  subtitle: "From binary bits to logic gates to a working computer",
  topic: "electrical engineering",
  level: "beginner",
  accent: "#a78bfa",
  createdAt: T0,
  lessons: [
    {
      id: "cat-elec-digital-logic-l0",
      title: "Bits and Binary",
      body: [
        "Deep down, computers only understand two states: on and off, high and low, 1 and 0. A single one of these is a bit.",
        "Bits are grouped: 8 bits make a byte, which can represent 256 different values. Numbers, letters, colors and instructions are all just patterns of bits.",
        "Binary is base-2: each place is worth double the one to its right — 1, 2, 4, 8, 16… Add up the places with a 1.",
      ],
      concept: {
        keyPoints: [
          "A bit is a single 1 or 0 — the smallest unit of information.",
          "8 bits = 1 byte = 256 possible values (0–255).",
          "Binary place values double: …16, 8, 4, 2, 1.",
        ],
        example:
          "The binary number 1011 =\n(1×8) + (0×4) + (1×2) + (1×1) = 8 + 2 + 1 = 11 in decimal.",
      },
      check: {
        question: "What is the binary number 101 in decimal?",
        answer: "5 → (1×4) + (0×2) + (1×1) = 4 + 1 = 5.",
      },
    },
    {
      id: "cat-elec-digital-logic-l1",
      title: "Logic Gates",
      body: [
        "A logic gate takes one or more binary inputs and produces a single binary output by a fixed rule. Gates are built from transistors.",
        "The three you must know: AND (output 1 only if all inputs are 1), OR (output 1 if any input is 1), and NOT (flips the input).",
        "From these three, every other operation a computer performs can be built.",
      ],
      concept: {
        keyPoints: [
          "AND → 1 only when every input is 1.",
          "OR → 1 when at least one input is 1.",
          "NOT → inverts: 0 becomes 1, 1 becomes 0.",
        ],
        vocab: [
          { term: "AND", meaning: "1·1 = 1, otherwise 0. Think 'both must be true'." },
          { term: "OR", meaning: "0+ anything true = 1. Think 'either will do'." },
          { term: "NOT", meaning: "A single-input inverter." },
          { term: "XOR", meaning: "Exclusive OR — 1 only when inputs differ. The heart of binary addition." },
        ],
      },
      check: {
        question: "An AND gate gets inputs 1 and 0. What does it output?",
        answer: "0 — AND outputs 1 only when both inputs are 1.",
      },
    },
    {
      id: "cat-elec-digital-logic-l2",
      title: "Combining Gates",
      body: [
        "Gates become useful when you wire them together so one gate's output feeds another's input.",
        "Combine an XOR and an AND and you get a half-adder — a circuit that adds two bits and reports both the sum and the carry.",
        "Chain adders together and you can add full binary numbers. This is literally how a processor does arithmetic.",
      ],
      concept: {
        keyPoints: [
          "Gate outputs can feed into other gates to build complex logic.",
          "XOR gives the sum bit; AND gives the carry bit — together they add two bits (a half-adder).",
          "Stacking adders lets a CPU add multi-bit numbers.",
        ],
        example:
          "Adding bits 1 + 1:\nXOR(1,1) = 0 → the sum bit.\nAND(1,1) = 1 → the carry bit.\nResult: 10 in binary = 2. Exactly right.",
      },
      check: {
        question: "Which gate produces the 'carry' when adding two bits?",
        answer: "AND — it outputs 1 only when both bits are 1, which is exactly when a carry happens.",
      },
    },
    {
      id: "cat-elec-digital-logic-l3",
      title: "From Gates to Computers",
      body: [
        "Add memory to logic and you have a computer. A flip-flop — a small loop of gates — can hold a single bit even after the input goes away.",
        "Millions of gates for logic plus millions of flip-flops for memory, all switching billions of times a second, become a CPU.",
        "Everything else — apps, games, this very lesson — is layers of abstraction stacked on top of those humble 1s and 0s.",
      ],
      concept: {
        keyPoints: [
          "A flip-flop stores one bit — the basis of memory and registers.",
          "Logic gates + memory + a clock = a programmable processor.",
          "All software is layers of abstraction over binary logic.",
        ],
        vocab: [
          { term: "Flip-flop", meaning: "A gate loop that latches and remembers a single bit." },
          { term: "Clock", meaning: "A steady pulse that synchronizes when every gate updates." },
          { term: "Register", meaning: "A small bank of flip-flops holding a number the CPU is working on." },
        ],
      },
      check: {
        question: "What lets a computer remember a bit after the input signal disappears?",
        answer: "A flip-flop — a small loop of gates that latches and holds the value.",
      },
    },
  ],
};

const electromagnetism: Course = {
  id: "cat-elec-electromagnetism",
  title: "Magnetism & Electromagnetism",
  subtitle: "How electricity and magnetism power motors and generators",
  topic: "electrical engineering",
  level: "intermediate",
  accent: "#fb7185",
  createdAt: T0,
  lessons: [
    {
      id: "cat-elec-electromagnetism-l0",
      title: "Magnetic Fields",
      body: [
        "A magnet has two poles, north and south. Like poles repel, opposite poles attract.",
        "Around every magnet is an invisible magnetic field — the region where its force acts. We draw it as lines flowing from north to south.",
        "The Earth itself is a giant magnet, which is why a compass needle lines up with the field and points north.",
      ],
      concept: {
        keyPoints: [
          "Every magnet has a north and a south pole — you can't have just one.",
          "Opposite poles attract; like poles repel.",
          "The magnetic field is the region of space where the magnet exerts force.",
        ],
      },
      check: {
        question: "What happens when you bring two north poles together?",
        answer: "They repel — like poles push apart.",
      },
    },
    {
      id: "cat-elec-electromagnetism-l1",
      title: "Electromagnets",
      body: [
        "Here's the key discovery: a current flowing through a wire creates a magnetic field around it. Electricity and magnetism are two sides of one coin.",
        "Coil that wire into many loops and the fields add up. Put an iron core in the middle and you get a powerful, controllable electromagnet.",
        "Because you can switch it on and off with the current, electromagnets run everything from doorbells to junkyard cranes to MRI machines.",
      ],
      concept: {
        keyPoints: [
          "Current through a wire produces a magnetic field around it.",
          "Coiling the wire (a solenoid) and adding an iron core concentrates the field.",
          "The magnet turns on and off with the current — that controllability is the whole point.",
        ],
        vocab: [
          { term: "Solenoid", meaning: "A coil of wire that becomes a magnet when current flows." },
          { term: "Core", meaning: "An iron center that dramatically strengthens the coil's field." },
        ],
      },
      check: {
        question: "How do you turn an electromagnet off?",
        answer: "Cut the current — no current means no magnetic field.",
      },
    },
    {
      id: "cat-elec-electromagnetism-l2",
      title: "Electric Motors",
      body: [
        "A motor turns electricity into motion. It puts a current-carrying coil inside a magnetic field.",
        "The field pushes on the coil (a force on moving charge), spinning it. A clever switch called a commutator flips the current each half-turn so the push keeps going the same way.",
        "The result is continuous rotation — the same principle behind fans, drills, electric cars, and hard drives.",
      ],
      concept: {
        keyPoints: [
          "A current-carrying coil in a magnetic field feels a turning force.",
          "The commutator reverses the current every half-turn to keep it spinning one way.",
          "Motors convert electrical energy into mechanical motion.",
        ],
        vocab: [
          { term: "Commutator", meaning: "A rotating switch that flips the coil's current each half-turn." },
          { term: "Torque", meaning: "The twisting force that makes the motor's shaft turn." },
        ],
      },
      check: {
        question: "What does a motor convert electrical energy into?",
        answer: "Mechanical energy — motion (rotation).",
      },
    },
    {
      id: "cat-elec-electromagnetism-l3",
      title: "Generators & Induction",
      body: [
        "Run a motor backwards and you get a generator. Instead of putting current in to get motion, you put motion in to get current.",
        "Faraday's law of induction: a changing magnetic field through a coil induces a voltage. Spin a magnet near a coil and electricity appears.",
        "This is how nearly all the world's power is made — coal, gas, nuclear, wind and hydro all just spin a generator by different means.",
      ],
      concept: {
        keyPoints: [
          "A changing magnetic field through a coil induces a voltage (Faraday's law).",
          "A generator is a motor in reverse: motion in, electricity out.",
          "Almost all grid power comes from spinning a generator somehow.",
        ],
        vocab: [
          { term: "Induction", meaning: "Creating a voltage by changing the magnetic field through a coil." },
          { term: "Faraday's law", meaning: "The faster the field changes, the bigger the induced voltage." },
        ],
        example:
          "A wind turbine: wind spins the blades → the blades spin a magnet inside a coil → the changing field induces a voltage → current flows to the grid. No fuel burned at the turbine at all.",
      },
      check: {
        question: "What induces a voltage in a generator's coil?",
        answer: "A changing magnetic field through the coil (electromagnetic induction).",
      },
    },
  ],
};

/* ------------------------------------------------------------------ *
 *  PHYSICS & CHEMISTRY
 * ------------------------------------------------------------------ */

const theAtom: Course = {
  id: "cat-phys-atom",
  title: "Inside the Atom",
  subtitle: "Protons, neutrons, electrons — and why they explain chemistry",
  topic: "physics",
  level: "beginner",
  accent: "#34d399",
  createdAt: T0,
  lessons: [
    {
      id: "cat-phys-atom-l0",
      title: "The Building Blocks",
      body: [
        "Everything around you is made of atoms — unimaginably tiny particles, millions across the width of a hair.",
        "An atom has a dense center, the nucleus, made of protons (positive) and neutrons (neutral). Around it, electrons (negative) whiz through shells.",
        "Rotate the model: a small heavy nucleus, with electrons orbiting on shells far outside it. Atoms are mostly empty space.",
      ],
      model: {
        caption: "A simple atom: a nucleus of protons and neutrons, orbited by electrons on shells.",
        cameraPosition: [0, 2, 6],
        parts: [
          { id: "cat-phys-atom-l0-p0", label: "Proton", shape: "sphere", position: [0.2, 0.1, 0], scale: [0.4, 0.4, 0.4], color: "#ef4444", finish: "matte", explanation: "A positively charged particle in the nucleus. The number of protons decides which element the atom is." },
          { id: "cat-phys-atom-l0-p1", label: "Proton", shape: "sphere", position: [-0.25, -0.15, 0.15], scale: [0.4, 0.4, 0.4], color: "#ef4444", finish: "matte", explanation: "Another proton. Two protons = helium; add more and you climb the periodic table." },
          { id: "cat-phys-atom-l0-p2", label: "Neutron", shape: "sphere", position: [0.05, -0.05, -0.3], scale: [0.4, 0.4, 0.4], color: "#94a3b8", finish: "matte", explanation: "A neutral particle that adds mass and helps hold the nucleus together." },
          { id: "cat-phys-atom-l0-p3", label: "Neutron", shape: "sphere", position: [-0.1, 0.35, -0.05], scale: [0.4, 0.4, 0.4], color: "#94a3b8", finish: "matte", explanation: "Changing the neutron count makes an isotope — same element, different mass." },
          { id: "cat-phys-atom-l0-p4", label: "Inner shell", shape: "torus", position: [0, 0, 0], scale: [1.5, 1.5, 1.5], rotation: [80, 0, 0], color: "#34d399", opacity: 0.5, finish: "glow", explanation: "The first electron shell. It fills up before electrons go to shells further out." },
          { id: "cat-phys-atom-l0-p5", label: "Outer shell", shape: "torus", position: [0, 0, 0], scale: [2.4, 2.4, 2.4], rotation: [70, 30, 0], color: "#38bdf8", opacity: 0.4, finish: "glow", explanation: "A higher-energy shell further from the nucleus. Outer-shell electrons drive chemistry." },
          { id: "cat-phys-atom-l0-p6", label: "Electron", shape: "sphere", position: [1.4, 0.3, 0.4], scale: [0.18, 0.18, 0.18], color: "#facc15", finish: "glow", emissiveIntensity: 0.7, explanation: "A tiny negative particle. Its pull toward the positive nucleus keeps it bound to the atom." },
          { id: "cat-phys-atom-l0-p7", label: "Electron", shape: "sphere", position: [-2.1, 0.2, -0.5], scale: [0.18, 0.18, 0.18], color: "#facc15", finish: "glow", emissiveIntensity: 0.7, explanation: "An electron on the outer shell — the ones that form bonds with other atoms." },
        ],
      },
      concept: {
        keyPoints: [
          "Protons: positive, in the nucleus. Their count = the element.",
          "Neutrons: neutral, in the nucleus, add mass.",
          "Electrons: negative, orbit in shells; atoms are mostly empty space.",
        ],
      },
      check: {
        question: "Which particle's count determines what element an atom is?",
        answer: "The proton — the number of protons (atomic number) defines the element.",
      },
    },
    {
      id: "cat-phys-atom-l1",
      title: "Electrons and Shells",
      body: [
        "Electrons don't orbit randomly — they occupy shells at set energy levels, filling from the inside out.",
        "The first shell holds up to 2 electrons, the next up to 8. The outermost occupied shell holds the valence electrons.",
        "Those valence electrons are everything in chemistry: they decide how eagerly an atom reacts and what it bonds with.",
      ],
      concept: {
        keyPoints: [
          "Electrons fill shells from the innermost outward.",
          "Shell capacities: 2, then 8, then 8… — a full outer shell is very stable.",
          "Valence electrons (outer shell) control an atom's chemistry.",
        ],
        vocab: [
          { term: "Shell", meaning: "An energy level electrons occupy around the nucleus." },
          { term: "Valence electrons", meaning: "The outermost electrons — the ones that form bonds." },
        ],
      },
      check: {
        question: "How many electrons fit in the first shell?",
        answer: "Two.",
      },
    },
    {
      id: "cat-phys-atom-l2",
      title: "Elements & the Periodic Table",
      body: [
        "Sort atoms by proton count and a stunning pattern appears: the periodic table.",
        "Rows (periods) fill shells; columns (groups) share the same number of valence electrons — and therefore very similar behavior.",
        "That's why all the metals in one column react alike, and why the noble gases on the far right, with full outer shells, barely react at all.",
      ],
      concept: {
        keyPoints: [
          "Elements are ordered by atomic number (proton count).",
          "Columns share valence-electron counts → similar chemical behavior.",
          "Noble gases have full outer shells and are almost inert.",
        ],
        vocab: [
          { term: "Period", meaning: "A row — atoms filling the same outer shell." },
          { term: "Group", meaning: "A column — atoms with the same number of valence electrons." },
        ],
      },
      check: {
        question: "Why do elements in the same column behave similarly?",
        answer: "They have the same number of valence (outer-shell) electrons, which governs how they react.",
      },
    },
    {
      id: "cat-phys-atom-l3",
      title: "Ions and Bonding",
      body: [
        "Atoms 'want' a full outer shell. To get there, they gain, lose, or share electrons — and that's chemical bonding.",
        "Lose or gain electrons and the atom becomes charged: an ion. Sodium gives one away (becomes +), chlorine takes it (becomes −), and their attraction forms salt.",
        "Share electrons instead and you get a covalent bond, like the two hydrogens sharing with oxygen in water.",
      ],
      concept: {
        keyPoints: [
          "Atoms bond to reach a full, stable outer shell.",
          "Ionic bond: one atom donates electrons to another; opposite charges attract.",
          "Covalent bond: atoms share electrons.",
        ],
        vocab: [
          { term: "Ion", meaning: "A charged atom that has lost or gained electrons." },
          { term: "Ionic bond", meaning: "Attraction between a positive and a negative ion (e.g. table salt)." },
          { term: "Covalent bond", meaning: "A shared pair of electrons between atoms (e.g. water)." },
        ],
        example:
          "Sodium (Na) has 1 lonely valence electron; chlorine (Cl) needs 1 more.\nNa hands its electron to Cl → Na⁺ and Cl⁻ → they snap together as NaCl, table salt.",
      },
      check: {
        question: "What is an atom called once it loses or gains electrons?",
        answer: "An ion — it now carries a net electric charge.",
      },
    },
  ],
};

const forcesAndMotion: Course = {
  id: "cat-phys-forces",
  title: "Forces & Motion",
  subtitle: "Newton's laws and the ideas behind everything that moves",
  topic: "physics",
  level: "beginner",
  accent: "#60a5fa",
  createdAt: T0,
  lessons: [
    {
      id: "cat-phys-forces-l0",
      title: "What Is a Force?",
      body: [
        "A force is simply a push or a pull. It can start motion, stop it, speed it up, slow it down, or change its direction.",
        "Forces come in pairs of type — gravity pulls down, friction resists sliding, tension pulls along a rope, the normal force holds you up off the ground.",
        "When forces are balanced, nothing about the motion changes. When they're unbalanced, motion changes — and that's the interesting case.",
      ],
      concept: {
        keyPoints: [
          "A force is a push or a pull, measured in newtons (N).",
          "Balanced forces → no change in motion. Unbalanced forces → motion changes.",
          "Common forces: gravity, friction, tension, the normal (support) force.",
        ],
      },
      check: {
        question: "If all the forces on an object are balanced, what happens to its motion?",
        answer: "Nothing changes — it stays still or keeps moving at constant velocity.",
      },
    },
    {
      id: "cat-phys-forces-l1",
      title: "Newton's First Law",
      body: [
        "An object at rest stays at rest, and an object in motion stays in motion at constant velocity — unless a net force acts on it.",
        "This is inertia: matter resists changes to its motion. Heavier objects have more inertia and are harder to speed up or stop.",
        "It's why you lurch forward when a car brakes: your body 'wants' to keep moving until a force (the seatbelt) stops it.",
      ],
      concept: {
        keyPoints: [
          "First law (inertia): motion only changes when a net force acts.",
          "More mass = more inertia = harder to start or stop.",
          "No net force means constant velocity — including zero.",
        ],
        vocab: [
          { term: "Inertia", meaning: "An object's resistance to any change in its motion." },
          { term: "Net force", meaning: "The single overall force left after combining all forces acting." },
        ],
      },
      check: {
        question: "Why do you feel thrown forward when a car suddenly brakes?",
        answer: "Inertia — your body keeps moving forward until a force (the seatbelt) stops it.",
      },
    },
    {
      id: "cat-phys-forces-l2",
      title: "Newton's Second Law",
      body: [
        "The second law is the workhorse equation of mechanics: F = m × a.",
        "The net force equals mass times acceleration. Push harder and it accelerates more; make it heavier and the same push accelerates it less.",
        "Rearranged, a = F / m tells you exactly how fast the velocity will change for a given push.",
      ],
      concept: {
        keyPoints: [
          "F = m × a: net force = mass × acceleration.",
          "Same force, more mass → less acceleration.",
          "a = F / m predicts how quickly velocity changes.",
        ],
        example:
          "A net force of 10 N pushes a 2 kg cart.\na = F / m = 10 / 2 = 5 m/s².\nThe cart speeds up by 5 metres per second, every second.",
      },
      check: {
        question: "A 4 N force acts on a 2 kg object. What is its acceleration?",
        answer: "a = F / m = 4 / 2 = 2 m/s².",
      },
    },
    {
      id: "cat-phys-forces-l3",
      title: "Newton's Third Law",
      body: [
        "For every action there is an equal and opposite reaction. Forces always come in pairs.",
        "Push on a wall and the wall pushes back on you just as hard. The two forces act on different objects, which is why they don't just cancel out.",
        "It's how everything propels: a rocket pushes exhaust down, so the exhaust pushes the rocket up. You push the ground back to walk forward.",
      ],
      concept: {
        keyPoints: [
          "Every force comes with an equal, opposite partner force.",
          "The pair acts on two different objects, so they don't cancel.",
          "Action–reaction is behind walking, swimming, and rocket thrust.",
        ],
        vocab: [
          { term: "Action–reaction pair", meaning: "Two equal, opposite forces each object exerts on the other." },
          { term: "Thrust", meaning: "The reaction force that pushes a rocket or jet forward." },
        ],
      },
      check: {
        question: "A rocket pushes exhaust gases downward. What pushes the rocket up?",
        answer: "The equal and opposite reaction force from the exhaust pushing back on the rocket.",
      },
    },
  ],
};

/* ------------------------------------------------------------------ *
 *  CATALOG
 * ------------------------------------------------------------------ */

export const CATALOG: CatalogCategory[] = [
  {
    id: "electrical-engineering",
    name: "Electrical Engineering",
    blurb: "Circuits, components, logic, and the physics that powers them.",
    icon: "⚡",
    courses: [
      electricityFundamentals,
      electronicComponents,
      digitalLogic,
      electromagnetism,
    ],
  },
  {
    id: "physics-chemistry",
    name: "Physics & Chemistry",
    blurb: "The building blocks of matter and the rules that move it.",
    icon: "🔬",
    courses: [theAtom, forcesAndMotion],
  },
];

/** Flat list of every catalog course. */
export const CATALOG_COURSES: Course[] = CATALOG.flatMap((c) => c.courses);

/** Look up a catalog course by id (used by the course viewer as a source). */
export function getCatalogCourse(id: string): Course | undefined {
  return CATALOG_COURSES.find((c) => c.id === id);
}

/** True if an id belongs to the built-in library (vs a generated course). */
export function isCatalogCourse(id: string): boolean {
  return id.startsWith("cat-");
}
