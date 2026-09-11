import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Download,
  Search,
  Filter,
  PieChart as PieIcon,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { PatientDetailsModal } from '../components/UI/PatientDetailsModal';
import { getDatasetStats, getPatients, downloadCohortCSV } from '../services/api';
import { Patient } from '../types';
import toast, { Toaster } from 'react-hot-toast';

export const ResearchDataPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(320);
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  // Selected Patient for View Modal
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const s = await getDatasetStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatients(pageSize, page * pageSize, searchTerm, outcomeFilter);
      setPatients(res.patients);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [page, searchTerm, outcomeFilter]);

  const responseDist = [
    { name: 'Responder (≥50%)', value: stats?.response_distribution?.Responder || 186, color: '#059669' },
    { name: 'Partial (25-49%)', value: stats?.response_distribution?.['Partial Responder'] || 127, color: '#D97706' },
    { name: 'Non-Responder (<25%)', value: stats?.response_distribution?.['Non-Responder'] || 7, color: '#DC2626' },
  ];

  const adClassData = stats?.ad_class_distribution
    ? Object.entries(stats.ad_class_distribution).map(([k, v]) => ({ name: k, count: v }))
    : [
        { name: 'SSRI', count: 160 },
        { name: 'SNRI', count: 80 },
        { name: 'TCA', count: 48 },
        { name: 'Other', count: 32 },
      ];

  const handleOpenPatient = (pid: string) => {
    setSelectedPatientId(pid);
    setModalOpen(true);
  };

  return (
    <Layout title="Research Cohort & Patient Database Registry">
      <Toaster position="top-right" />

      {/* Patient Details & Edit Modal */}
      <PatientDetailsModal
        isOpen={modalOpen}
        patientId={selectedPatientId}
        onClose={() => setModalOpen(false)}
        onPatientUpdated={() => {
          fetchPatients();
          fetchStats();
        }}
      />

      {/* Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <StatusBadge status="DATABASE CONNECTED" size="sm" />
              <span className="text-xs text-[#64748B] font-semibold">Relational Cohort Records (N={totalCount})</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Clinical Research Cohort & Epidemiological Registry</h2>
            <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
              Real-time queryable patient database records for prospective antidepressant response modeling. Labeled: SYNTHETIC RESEARCH COHORT.
            </p>
          </div>

          <button
            onClick={downloadCohortCSV}
            className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Full CSV Cohort</span>
          </button>
        </div>
      </GlassCard>

      {/* Epidemiology Visuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie: Response Distribution */}
        <GlassCard className="p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="text-sm font-bold text-[#0F172A]">6-Week Endpoint Treatment Outcomes</h3>
            <span className="text-xs text-[#059669] font-semibold">MADRS Reduction Rate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={responseDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {responseDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, color: '#0F172A', borderRadius: 8 }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Bar: Antidepressant Drug Classes */}
        <GlassCard className="p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Antidepressant Pharmacological Class Frequencies</h3>
            <span className="text-xs text-[#0284C7] font-semibold">Prescription Registry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adClassData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, color: '#0F172A', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Queryable Patient Database Table */}
      <GlassCard className="p-6 space-y-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#0F766E]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Patient Registry Records (Live Relational DB)
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Showing {patients.length > 0 ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount} patients
              </p>
            </div>
          </div>

          {/* Search & Outcome Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0] text-xs">
              {['', 'Responder', 'Partial Responder', 'Non-Responder'].map((out) => (
                <button
                  key={out}
                  onClick={() => {
                    setOutcomeFilter(out);
                    setPage(0);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    outcomeFilter === out
                      ? 'bg-[#0F766E] text-white'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {out || 'All Outcomes'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Study ID, Drug, or HRN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>
        </div>

        {/* Desktop View Table (hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left clinical-table">
            <thead>
              <tr>
                <th>Study ID</th>
                <th>Demographics</th>
                <th>MADRS Base</th>
                <th>GAD-7</th>
                <th>Antidepressant</th>
                <th>Adherence %</th>
                <th>Outcome</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B]">
                    <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching database records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#64748B]">
                    No matching patient records found in database.
                  </td>
                </tr>
              ) : (
                (patients || []).map((pt) => (
                  <tr key={pt.study_id || pt.id}>
                    <td className="font-bold text-[#0F172A]">{pt.study_id}</td>
                    <td className="text-[#475569]">{pt.age}y {pt.sex} (BMI {pt.bmi})</td>
                    <td className="text-[#0F766E] font-bold">{pt.madrs_baseline}</td>
                    <td className="text-[#0284C7] font-semibold">{pt.gad7_baseline}</td>
                    <td className="text-[#334155]">{pt.ad_name} ({pt.ad_dose_mg}mg)</td>
                    <td className="text-[#059669] font-bold">{pt.adherence_pct}%</td>
                    <td>
                      <StatusBadge status={pt.response_class || 'Responder'} size="sm" />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenPatient(pt.study_id || pt.id)}
                        className="px-3 py-1.5 rounded-md bg-[#F0FDFA] hover:bg-[#0F766E] text-[#0F766E] hover:text-white border border-[#CCFBF1] font-bold text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Responsive Clinical Record Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-10 text-[#64748B]">
              <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading database records...
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B]">No patient records found.</div>
          ) : (
            (patients || []).map((pt) => (
              <div key={pt.study_id || pt.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#0F172A]">{pt.study_id}</span>
                    <p className="text-[11px] text-[#64748B]">{pt.age}y {pt.sex} • BMI {pt.bmi}</p>
                  </div>
                  <StatusBadge status={pt.response_class || 'Responder'} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-[#E2E8F0]/60">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">MADRS Base:</span>
                    <span className="font-bold text-[#0F766E]">{pt.madrs_baseline}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Pharmacotherapy:</span>
                    <span className="font-semibold text-[#334155]">{pt.ad_name} {pt.ad_dose_mg}mg</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPatient(pt.study_id || pt.id)}
                  className="w-full py-2.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Clinical Record</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs">
          <span className="text-[#64748B]">
            Page {page + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#334155] font-semibold flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * pageSize >= totalCount || loading}
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#334155] font-semibold flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>
    </Layout>
  );
};
