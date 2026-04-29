import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  X,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../utils/api';

export type InvitableRole = 'admin' | 'operator' | 'agent' | 'financial_operator';

interface InvitePersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which roles can be selected in this modal. Super Admin can include 'admin'. */
  availableRoles: InvitableRole[];
  /** Default role pre-selected when the modal opens */
  defaultRole?: InvitableRole;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  role: InvitableRole;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

const ROLE_META: Record<
  InvitableRole,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  admin: {
    label: 'Admin',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'Full operational authority — can manage agents, operators, and disputes.',
  },
  operator: {
    label: 'Operator',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Neutral mediator — routes requests between Customers and Agents.',
  },
  agent: {
    label: 'Agent',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Primary executor — fulfills service requests within their zone.',
  },
  financial_operator: {
    label: 'Financial Operator',
    color: 'text-indigo-900',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    description: 'Financial verifier — validates bank transfers and approves package upgrades.',
  },
};

const InvitePersonnelModal: React.FC<InvitePersonnelModalProps> = ({
  isOpen,
  onClose,
  availableRoles,
  defaultRole,
}) => {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    role: defaultRole ?? availableRoles[0],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ inviteUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setForm({ fullName: '', email: '', phone: '', role: defaultRole ?? availableRoles[0] });
      setErrors({});
      setSuccessData(null);
      setCopied(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultRole, availableRoles]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Full name (first and last) is required.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'A valid email address is required.';
    }
    if (!form.phone.trim() || !/^\+?[\d\s\-()]{7,20}$/.test(form.phone)) {
      newErrors.phone = 'A valid phone number is required (e.g. +251 91 234 5678).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/users/invite', {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: form.role,
      });
      const inviteToken = response.data.invite?.token;
      const dynamicUrl = inviteToken ? `${window.location.origin}/#/register/claim?token=${inviteToken}` : response.data.inviteUrl;
      setSuccessData({ inviteUrl: dynamicUrl });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'The system failed to generate the invitation. The contact may already exist.';
      setErrors({ email: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (successData?.inviteUrl) {
      navigator.clipboard.writeText(successData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  const selectedRole = ROLE_META[form.role];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.65)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="px-8 pt-7 pb-5 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                Delegate Authority
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Platform Personnel Invitation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {successData ? (
            /* ── Success State ── */
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-black text-emerald-800">Invitation Dispatched</p>
                  <p className="text-xs text-emerald-600 font-medium">
                    A cryptographic token has been generated. Share the link below with{' '}
                    <strong>{form.fullName}</strong>.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Invite Link (expires in 72 hours)
                </label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-mono text-slate-600 flex-1 truncate">
                    {successData.inviteUrl}
                  </p>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      copied
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {copied ? (
                      <><CheckCircle2 className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Role Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen((v) => !v)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${selectedRole.bg} ${selectedRole.border} ${selectedRole.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{selectedRole.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                      {availableRoles.map((r) => {
                        const meta = ROLE_META[r];
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              handleFieldChange('role', r);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 transition-colors hover:${meta.bg} border-b border-slate-50 last:border-none`}
                          >
                            <p className={`text-sm font-black ${meta.color}`}>{meta.label}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {meta.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Role description hint */}
                <p className="text-[11px] text-slate-400 font-medium mt-1.5 px-1">
                  {selectedRole.description}
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="e.g. Abebe Girma"
                    value={form.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                      errors.fullName
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    placeholder="e.g. abebe@erkata.app"
                    value={form.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                      errors.email
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone — mandatory */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  Phone Number <span className="text-red-400">*required</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    placeholder="+251 91 234 5678"
                    value={form.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                      errors.phone
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 text-sm font-black hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-lg shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Send Invite</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InvitePersonnelModal;
