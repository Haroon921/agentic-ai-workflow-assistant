//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useMemo, useState } from 'react';
import { VegaVisual, useCssTheme } from '@microsoft/fabric-visuals';
import type { VisualizationSpec } from '@microsoft/fabric-visuals';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Cloud,
  Database,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  Waves,
  X,
} from 'lucide-react';

import { useTheme } from './hooks/theme.context';
import { decisions, workloads } from './modernize-data';

type Page = 'overview' | 'estate' | 'assessment' | 'recommendations' | 'waves' | 'business' | 'decisions';

const navigation: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'estate', label: 'Data Estate', icon: Database },
  { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'waves', label: 'Migration Waves', icon: Waves },
  { id: 'business', label: 'Business Case', icon: BriefcaseBusiness },
  { id: 'decisions', label: 'Decisions & Actions', icon: CheckCircle2 },
];

const chartConfig = {
  axis: { labelColor: '#616161', titleColor: '#424242', gridColor: '#e8edf3', domain: false, ticks: false },
  view: { stroke: null },
  legend: { labelColor: '#424242', titleColor: '#242424', orient: 'bottom' as const },
};

const platformSpec: VisualizationSpec = {
  data: { values: [
    { category: 'SQL Server', value: 68 }, { category: 'Oracle', value: 18 },
    { category: 'PostgreSQL', value: 15 }, { category: 'MySQL', value: 11 },
    { category: 'Other', value: 12 },
  ] },
  mark: { type: 'bar', cornerRadiusEnd: 4 },
  encoding: {
    y: { field: 'category', type: 'nominal', sort: '-x', title: null },
    x: { field: 'value', type: 'quantitative', title: 'Workloads' },
    color: { value: '#0f6cbd' },
    tooltip: [{ field: 'category', type: 'nominal' }, { field: 'value', type: 'quantitative', title: 'Workloads' }],
  },
  config: chartConfig,
};

const hostingSpec: VisualizationSpec = {
  data: { values: [
    { category: 'On-premises', value: 54 }, { category: 'Azure', value: 29 },
    { category: 'Other cloud', value: 23 }, { category: 'Edge', value: 18 },
  ] },
  mark: { type: 'arc', innerRadius: 55, stroke: '#ffffff', strokeWidth: 2 },
  encoding: {
    theta: { field: 'value', type: 'quantitative' },
    color: { field: 'category', type: 'nominal', scale: { range: ['#0f6cbd', '#00a4ef', '#00b7c3', '#8a8886'] }, legend: { title: null } },
    tooltip: [{ field: 'category', type: 'nominal' }, { field: 'value', type: 'quantitative', title: 'Workloads' }],
  },
  config: chartConfig,
};

const readinessSpec: VisualizationSpec = {
  data: { values: [
    { category: 'Ready now', value: 37, order: 1 }, { category: 'Needs remediation', value: 49, order: 2 },
    { category: 'Discovery required', value: 38, order: 3 },
  ] },
  mark: { type: 'bar', cornerRadius: 5, height: 28 },
  encoding: {
    x: { field: 'value', type: 'quantitative', stack: 'normalize', axis: { format: '%', title: null } },
    color: { field: 'category', type: 'nominal', sort: { field: 'order' }, scale: { range: ['#107c10', '#ffaa44', '#d13438'] }, legend: { title: null } },
    tooltip: [{ field: 'category', type: 'nominal' }, { field: 'value', type: 'quantitative', title: 'Workloads' }],
  },
  config: chartConfig,
};

const targetSpec: VisualizationSpec = {
  data: { values: [
    { category: 'Azure SQL DB', value: 31 }, { category: 'Managed Instance', value: 28 },
    { category: 'Azure VM', value: 22 }, { category: 'Fabric SQL', value: 17 },
    { category: 'Azure Local', value: 14 }, { category: 'Retain', value: 12 },
  ] },
  mark: { type: 'bar', cornerRadiusEnd: 4 },
  encoding: {
    x: { field: 'category', type: 'nominal', sort: '-y', title: null, axis: { labelAngle: -25 } },
    y: { field: 'value', type: 'quantitative', title: 'Workloads' },
    color: { field: 'value', type: 'quantitative', scale: { range: ['#8be0e8', '#0078d4'] }, legend: null },
    tooltip: [{ field: 'category', type: 'nominal' }, { field: 'value', type: 'quantitative', title: 'Workloads' }],
  },
  config: chartConfig,
};

const waveSpec: VisualizationSpec = {
  data: { values: [
    { wave: 'Wave 1', status: 'Ready', value: 22 }, { wave: 'Wave 1', status: 'Planned', value: 12 },
    { wave: 'Wave 2', status: 'Ready', value: 14 }, { wave: 'Wave 2', status: 'Planned', value: 31 },
    { wave: 'Wave 3', status: 'Ready', value: 5 }, { wave: 'Wave 3', status: 'Planned', value: 40 },
  ] },
  mark: { type: 'bar', cornerRadiusEnd: 3 },
  encoding: {
    y: { field: 'wave', type: 'nominal', title: null },
    x: { field: 'value', type: 'quantitative', title: 'Workloads' },
    color: { field: 'status', type: 'nominal', scale: { range: ['#00b7c3', '#c7e0f4'] }, legend: { title: null } },
    tooltip: [{ field: 'wave', type: 'nominal' }, { field: 'status', type: 'nominal' }, { field: 'value', type: 'quantitative' }],
  },
  config: chartConfig,
};

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300',
    danger: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-950 dark:text-red-300',
    info: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-950 dark:text-blue-300',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-200 py-100-nudge text-200 font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

function toneFor(value: string) {
  if (['Complete', 'Approved', 'Ready', 'On track', 'Low'].includes(value)) return 'success' as const;
  if (['High', 'At risk'].includes(value)) return 'danger' as const;
  if (['In progress', 'Medium', 'Conditional', 'In review'].includes(value)) return 'warning' as const;
  return 'neutral' as const;
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-600 flex flex-wrap items-end justify-between gap-400">
      <div>
        <p className="mb-100 text-200 font-semibold uppercase tracking-[0.14em] text-primary">Modernization workspace</p>
        <h1 className="font-heading text-hero-800 font-semibold tracking-tight">{title}</h1>
        <p className="mt-200 max-w-3xl text-300 text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-200 rounded-full bg-cyan-50 px-300 py-200 text-200 font-semibold text-cyan-800 ring-1 ring-cyan-700/10 dark:bg-cyan-950 dark:text-cyan-200">
        <span className="size-200 rounded-full bg-cyan-500" /> Sample data
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, spec, className = '' }: { title: string; subtitle: string; spec: VisualizationSpec; className?: string }) {
  const theme = useCssTheme();
  return (
    <section className={`rounded-xl border bg-card p-500 shadow-sm ${className}`}>
      <h2 className="text-400 font-semibold">{title}</h2>
      <p className="mb-300 mt-100 text-200 text-muted-foreground">{subtitle}</p>
      <div className="h-64"><VegaVisual spec={spec} theme={theme} /></div>
    </section>
  );
}

function Overview() {
  const kpis = [
    { label: 'Total database workloads', value: '124', detail: 'Across 18 applications', icon: Database, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Modernization candidates', value: '86', detail: '69% of the assessed estate', icon: Target, tone: 'text-cyan-700 bg-cyan-50' },
    { label: 'High-risk / EOS workloads', value: '31', detail: '12 require action this quarter', icon: ShieldAlert, tone: 'text-red-700 bg-red-50' },
    { label: 'Estimated Azure ACR', value: '$3.8M', detail: 'Annual recurring revenue', icon: CircleDollarSign, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Quick-win candidates', value: '34', detail: 'Wave 1 ready or near-ready', icon: Sparkles, tone: 'text-violet-700 bg-violet-50' },
    { label: 'Assessment completion', value: '76%', detail: '94 of 124 workloads', icon: ClipboardCheck, tone: 'text-amber-700 bg-amber-50' },
  ];
  return (
    <>
      <PageHeader title="Executive Overview" description="A portfolio-level view of modernization readiness, risk, and Azure opportunity across the sample data estate." />
      <div className="grid gap-400 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-xl border bg-card p-500 shadow-sm">
            <div className="flex items-start justify-between gap-300">
              <div><p className="text-200 font-medium text-muted-foreground">{label}</p><p className="mt-200 font-numeric text-hero-800 font-semibold tracking-tight">{value}</p></div>
              <span className={`rounded-lg p-200 ${tone}`}><Icon className="icon-size-300" /></span>
            </div>
            <p className="mt-300 border-t pt-300 text-200 text-muted-foreground">{detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-400 grid gap-400 xl:grid-cols-2">
        <ChartCard title="Estate by database platform" subtitle="124 workloads by current engine" spec={platformSpec} />
        <ChartCard title="Estate by hosting location" subtitle="Current workload placement" spec={hostingSpec} />
        <ChartCard title="Modernization readiness" subtitle="Portfolio readiness classification" spec={readinessSpec} className="xl:col-span-2" />
        <ChartCard title="Recommended target distribution" subtitle="Preferred target based on completed assessments" spec={targetSpec} />
        <ChartCard title="Migration wave distribution" subtitle="Ready and planned workloads by wave" spec={waveSpec} />
      </div>
    </>
  );
}

function DataEstate() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('All engines');
  const filtered = useMemo(() => workloads.filter((workload) => {
    const searchable = Object.values(workload).join(' ').toLowerCase();
    return searchable.includes(query.toLowerCase()) && (engine === 'All engines' || workload.engine === engine);
  }), [query, engine]);
  return (
    <>
      <PageHeader title="Data Estate" description="Search and filter the sample inventory to understand platform, hosting, lifecycle risk, and assessment coverage." />
      <div className="mb-400 flex flex-col gap-300 rounded-xl border bg-card p-400 shadow-sm md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search inventory</span>
          <Search className="absolute left-300 top-1/2 icon-size-200 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, application, database, or platform" className="h-10 w-full rounded-md border bg-background pl-10 pr-300 text-300 outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label>
          <span className="sr-only">Filter by database engine</span>
          <select value={engine} onChange={(event) => setEngine(event.target.value)} className="h-10 min-w-48 rounded-md border bg-background px-300 text-300 outline-none focus:ring-2 focus:ring-ring">
            <option>All engines</option><option>SQL Server</option><option>Oracle</option><option>PostgreSQL</option><option>MySQL</option>
          </select>
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-200">
            <thead className="border-b bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300"><tr>
              {['Customer', 'Application', 'Database / workload', 'Engine', 'Version', 'Hosting', 'Size', 'Criticality', 'EOS risk', 'Azure state', 'Assessment'].map((heading) => <th key={heading} className="px-400 py-300 font-semibold">{heading}</th>)}
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map((item) => <tr key={item.id} className="hover:bg-accent">
                <td className="px-400 py-300 font-medium">{item.customer}</td><td className="px-400 py-300">{item.application}</td>
                <td className="px-400 py-300"><div className="font-semibold text-primary">{item.database}</div><div className="text-muted-foreground">{item.id}</div></td>
                <td className="px-400 py-300">{item.engine}</td><td className="px-400 py-300">{item.version}</td><td className="px-400 py-300">{item.hosting}</td><td className="px-400 py-300">{item.size}</td>
                <td className="px-400 py-300"><Badge tone={toneFor(item.criticality)}>{item.criticality}</Badge></td>
                <td className="px-400 py-300"><Badge tone={toneFor(item.eosRisk)}>{item.eosRisk}</Badge></td>
                <td className="px-400 py-300">{item.azureState}</td><td className="px-400 py-300"><Badge tone={toneFor(item.assessment)}>{item.assessment}</Badge></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="border-t px-400 py-300 text-200 text-muted-foreground">Showing {filtered.length} of {workloads.length} sample workloads</div>
      </div>
    </>
  );
}

function Assessment() {
  return (
    <>
      <PageHeader title="Assessment" description="Compare technical fit, delivery complexity, business risk, and blockers for every sample workload." />
      <div className="grid gap-400">
        {workloads.map((item) => <article key={item.id} className="rounded-xl border bg-card p-500 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-300">
            <div><div className="flex items-center gap-200"><h2 className="text-500 font-semibold">{item.database}</h2><Badge tone={toneFor(item.assessment)}>{item.assessment}</Badge></div><p className="mt-100 text-200 text-muted-foreground">{item.customer} · {item.application} · {item.engine} {item.version}</p></div>
            <div className="text-right"><p className="text-200 text-muted-foreground">Readiness score</p><p className="font-numeric text-hero-700 font-semibold text-primary">{item.readiness}</p></div>
          </div>
          <div className="my-400 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${item.readiness}%` }} /></div>
          <dl className="grid gap-400 text-300 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-200 text-muted-foreground">Compatibility</dt><dd className="mt-100 font-semibold">{item.compatibility}</dd></div>
            <div><dt className="text-200 text-muted-foreground">Migration complexity</dt><dd className="mt-100"><Badge tone={toneFor(item.complexity)}>{item.complexity}</Badge></dd></div>
            <div><dt className="text-200 text-muted-foreground">Business criticality / EOS</dt><dd className="mt-100 flex gap-100"><Badge tone={toneFor(item.criticality)}>{item.criticality}</Badge><Badge tone={toneFor(item.eosRisk)}>{item.eosRisk}</Badge></dd></div>
            <div><dt className="text-200 text-muted-foreground">Migration pattern</dt><dd className="mt-100 font-semibold">{item.pattern}</dd></div>
            <div className="sm:col-span-1 lg:col-span-2"><dt className="text-200 text-muted-foreground">Dependencies</dt><dd className="mt-100">{item.dependencies}</dd></div>
            <div className="sm:col-span-1 lg:col-span-2"><dt className="text-200 text-muted-foreground">Blockers</dt><dd className="mt-100">{item.blockers}</dd></div>
          </dl>
        </article>)}
      </div>
    </>
  );
}

function Recommendations() {
  return (
    <>
      <PageHeader title="Recommendations" description="Evidence-led target recommendations balancing platform fit, migration effort, business value, and delivery confidence." />
      <div className="grid gap-400 lg:grid-cols-2">
        {workloads.map((item) => <article key={item.id} className="flex flex-col rounded-xl border bg-card p-500 shadow-sm">
          <div className="flex items-start justify-between gap-300">
            <div><p className="text-200 font-semibold text-primary">{item.database}</p><h2 className="mt-100 text-500 font-semibold">{item.target}</h2></div>
            <div className="rounded-lg bg-blue-50 p-200 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{item.target.includes('Local') ? <Building2 className="icon-size-300" /> : <Cloud className="icon-size-300" />}</div>
          </div>
          <p className="mt-300 text-300 text-muted-foreground">{item.rationale}</p>
          <dl className="mt-400 grid gap-300 border-t pt-400 text-300">
            <div className="flex justify-between gap-300"><dt className="text-muted-foreground">Migration pattern</dt><dd className="font-semibold">{item.pattern}</dd></div>
            <div><dt className="text-200 text-muted-foreground">Expected business benefit</dt><dd className="mt-100">{item.benefit}</dd></div>
            <div><dt className="text-200 text-muted-foreground">Technical considerations</dt><dd className="mt-100">{item.considerations}</dd></div>
          </dl>
          <div className="mt-auto pt-400"><div className="mb-100 flex justify-between text-200"><span className="text-muted-foreground">Confidence / readiness</span><span className="font-semibold">{item.readiness}%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${item.readiness}%` }} /></div></div>
        </article>)}
      </div>
    </>
  );
}

function MigrationWaves() {
  const waves = [
    { name: 'Wave 1', title: 'Quick wins', count: 34, value: '$1.2M', status: 'Ready', description: 'Low-complexity workloads with strong compatibility and minimal blockers.', dependencies: 'Landing zone, migration factory, business validation', color: 'from-cyan-500 to-blue-600' },
    { name: 'Wave 2', title: 'Moderate complexity', count: 45, value: '$1.5M', status: 'Planned', description: 'Workloads requiring remediation, dependency sequencing, or controlled refactoring.', dependencies: 'Wave 1 patterns, remediation backlog, test environments', color: 'from-blue-600 to-indigo-600' },
    { name: 'Wave 3', title: 'Strategic / complex', count: 45, value: '$1.1M', status: 'Discovery', description: 'Business-critical platforms needing architecture change and executive alignment.', dependencies: 'Target architecture, vendor roadmap, operating model decisions', color: 'from-indigo-600 to-violet-600' },
  ];
  return (
    <>
      <PageHeader title="Migration Waves" description="Sequence the portfolio into executable waves based on readiness, complexity, risk, and prerequisite dependencies." />
      <div className="grid gap-400 xl:grid-cols-3">
        {waves.map((wave, index) => <article key={wave.name} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className={`bg-gradient-to-r ${wave.color} p-500 text-white`}><div className="flex justify-between"><span className="text-200 font-semibold uppercase tracking-wider">{wave.name}</span><span className="rounded-full bg-white/20 px-300 py-100 text-200 font-semibold">{wave.status}</span></div><h2 className="mt-300 text-600 font-semibold">{wave.title}</h2></div>
          <div className="p-500"><div className="flex gap-600"><div><p className="font-numeric text-hero-800 font-semibold">{wave.count}</p><p className="text-200 text-muted-foreground">Workloads</p></div><div><p className="font-numeric text-hero-800 font-semibold">{wave.value}</p><p className="text-200 text-muted-foreground">Annual value</p></div></div>
          <p className="mt-400 text-300">{wave.description}</p><div className="mt-400 rounded-lg bg-secondary p-300"><p className="text-200 font-semibold">Key dependencies</p><p className="mt-100 text-200 text-muted-foreground">{wave.dependencies}</p></div>
          <div className="mt-400 flex items-center gap-200 text-200 font-semibold text-primary"><span className="flex size-600 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">{index + 1}</span>{index === 0 ? 'Mobilize now' : 'Sequenced after prior wave'}<ArrowRight className="icon-size-200" /></div></div>
        </article>)}
      </div>
      <div className="mt-400"><ChartCard title="Portfolio sequencing" subtitle="Ready and planned workload distribution across the modernization roadmap" spec={waveSpec} /></div>
    </>
  );
}

function BusinessCase() {
  const metrics = [
    { label: 'Estimated Azure ACR', value: '$3.8M', note: '+18% scenario upside', icon: CircleDollarSign },
    { label: 'Number of opportunities', value: '86', note: 'Across 18 applications', icon: Target },
    { label: 'Workloads modernized', value: '79', note: '64% portfolio coverage', icon: Database },
    { label: 'Partner delivery opportunity', value: '$6.4M', note: 'Estimated services value', icon: BriefcaseBusiness },
    { label: 'Risk reduction', value: '74%', note: '23 high-risk assets addressed', icon: ShieldAlert },
    { label: 'Migration wave value', value: '$10.2M', note: '3-year modeled benefit', icon: Waves },
  ];
  return (
    <>
      <PageHeader title="Business Case" description="Translate technical recommendations into a decision-ready view of cloud value, delivery opportunity, and risk reduction." />
      <section className="mb-400 overflow-hidden rounded-xl bg-gradient-to-br from-[#062a48] via-[#064e72] to-[#007c91] p-600 text-white shadow-lg">
        <p className="text-200 font-semibold uppercase tracking-[0.14em] text-cyan-200">Modeled three-year value</p><div className="mt-300 flex flex-wrap items-end justify-between gap-500"><div><p className="font-numeric text-hero-1000 font-semibold tracking-tight">$10.2M</p><p className="mt-100 max-w-xl text-300 text-blue-100">Potential combined cloud economics, avoided infrastructure cost, and productivity value from the sample modernization roadmap.</p></div><Badge tone="success">Illustrative scenario</Badge></div>
      </section>
      <div className="grid gap-400 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, note, icon: Icon }) => <article key={label} className="rounded-xl border bg-card p-500 shadow-sm"><div className="flex items-center gap-300"><span className="rounded-lg bg-blue-50 p-200 text-primary dark:bg-blue-950"><Icon className="icon-size-300" /></span><p className="text-200 font-medium text-muted-foreground">{label}</p></div><p className="mt-400 font-numeric text-hero-800 font-semibold">{value}</p><p className="mt-200 text-200 text-muted-foreground">{note}</p></article>)}
      </div>
      <section className="mt-400 rounded-xl border bg-card p-500 shadow-sm"><div className="mb-500 flex items-center justify-between"><div><h2 className="text-500 font-semibold">Value by migration wave</h2><p className="mt-100 text-200 text-muted-foreground">Illustrative annual value realization profile</p></div><Activity className="text-primary" /></div>
        {[['Wave 1 · Quick wins', 32, '$1.2M'], ['Wave 2 · Moderate complexity', 68, '$1.5M'], ['Wave 3 · Strategic / complex', 100, '$1.1M']].map(([label, width, value]) => <div key={label} className="mb-400 grid items-center gap-300 md:grid-cols-[220px_1fr_70px]"><span className="text-300 font-medium">{label}</span><div className="h-600 overflow-hidden rounded-md bg-muted"><div className="h-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${width}%` }} /></div><span className="text-right font-numeric text-300 font-semibold">{value}</span></div>)}
      </section>
    </>
  );
}

function Decisions() {
  return (
    <>
      <PageHeader title="Decisions & Actions" description="Maintain a clear record of recommendation decisions, accountable owners, rationale, and the next action required." />
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-300">
        <thead className="border-b bg-slate-50 text-200 text-slate-600 dark:bg-slate-900 dark:text-slate-300"><tr>{['Workload', 'Recommendation', 'Decision', 'Decision rationale', 'Owner', 'Status', 'Next action'].map((heading) => <th key={heading} className="px-400 py-300 font-semibold">{heading}</th>)}</tr></thead>
        <tbody className="divide-y">{decisions.map((item) => <tr key={item.workload} className="hover:bg-accent"><td className="px-400 py-400 font-semibold text-primary">{item.workload}</td><td className="px-400 py-400">{item.recommendation}</td><td className="px-400 py-400"><Badge tone={toneFor(item.decision)}>{item.decision}</Badge></td><td className="px-400 py-400 text-muted-foreground">{item.rationale}</td><td className="px-400 py-400 font-medium">{item.owner}</td><td className="px-400 py-400"><Badge tone={toneFor(item.status)}>{item.status}</Badge></td><td className="px-400 py-400"><div className="flex items-center gap-200 font-medium">{item.nextAction}<ArrowRight className="icon-size-200 text-primary" /></div></td></tr>)}</tbody>
      </table></div><div className="border-t px-400 py-300 text-200 text-muted-foreground">5 decision records · Sample review data</div></div>
    </>
  );
}

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [navOpen, setNavOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const content = {
    overview: <Overview />, estate: <DataEstate />, assessment: <Assessment />,
    recommendations: <Recommendations />, waves: <MigrationWaves />,
    business: <BusinessCase />, decisions: <Decisions />,
  }[page];

  return (
    <div className="min-h-full bg-[#f4f7fb] text-foreground dark:bg-[#111827]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#082d4f] text-white shadow-xl transition-transform lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-500">
          <button type="button" onClick={() => { setPage('overview'); setNavOpen(false); }} className="flex items-center gap-300 text-left">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500"><BarChart3 className="icon-size-300" /></span>
            <span><span className="block text-400 font-semibold">Modernize360</span><span className="block text-100 text-blue-200">Data Estate Advisor</span></span>
          </button>
          <button type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation" className="rounded-md p-200 hover:bg-white/10 lg:hidden"><X className="icon-size-300" /></button>
        </div>
        <nav className="flex-1 space-y-100 p-300" aria-label="Primary navigation">
          <p className="px-300 pb-200 pt-300 text-100 font-semibold uppercase tracking-[0.16em] text-blue-300">Modernization plan</p>
          {navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { setPage(id); setNavOpen(false); }} className={`flex w-full items-center gap-300 rounded-md px-300 py-300 text-left text-300 font-medium transition-colors ${page === id ? 'bg-white text-[#082d4f] shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}><Icon className="icon-size-300" />{label}</button>)}
        </nav>
        <div className="m-300 rounded-lg border border-white/10 bg-white/5 p-400"><div className="flex items-center gap-200 text-200 font-semibold text-cyan-200"><ShieldAlert className="icon-size-200" /> Portfolio signal</div><p className="mt-200 text-200 leading-400 text-blue-100">31 EOS-risk workloads need a funded action plan.</p></div>
      </aside>
      {navOpen && <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Close navigation overlay" onClick={() => setNavOpen(false)} />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b bg-background/95 px-400 backdrop-blur md:px-600">
          <div className="flex items-center gap-300"><button type="button" onClick={() => setNavOpen(true)} aria-label="Open navigation" className="rounded-md border p-200 lg:hidden"><Menu className="icon-size-300" /></button><div><p className="text-300 font-semibold">Contoso Group portfolio</p><p className="text-100 text-muted-foreground">Executive review · FY27 planning</p></div></div>
          <div className="flex items-center gap-200">
            <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Use light theme' : 'Use dark theme'} className="rounded-md border p-200 text-muted-foreground hover:bg-accent hover:text-foreground">{isDark ? <Sun className="icon-size-300" /> : <Moon className="icon-size-300" />}</button>
            <button type="button" className="hidden items-center gap-200 rounded-md border bg-card px-300 py-200 text-200 font-medium hover:bg-accent sm:flex">All business units<ChevronDown className="icon-size-200" /></button>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-200 font-semibold text-white">MC</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-400 md:p-600 lg:p-800">{content}</main>
      </div>
    </div>
  );
}

export default App;
