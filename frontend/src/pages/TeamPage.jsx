import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Layers, 
  AlertOctagon, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Trash2,
  Briefcase,
  User,
  Tag,
  Loader2,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  Send,
  Copy,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useToast } from '../context/ToastContext';
import { AVATAR_PRESETS, DEFAULT_AVATAR } from '../services/avatars';
import { generateInviteDetails, sendGmailInvite, sendMailtoInvite } from '../services/gmailInvite';

export const TeamPage = () => {
  const { user, switchPersona } = useAuth();
  const { 
    workspace, 
    currentWorkspace, 
    teamMembers, 
    addTeamMember, 
    removeTeamMember, 
    openCreateWorkspaceModal 
  } = useMemory();
  const toast = useToast();

  const isDemo = currentWorkspace?.isDemo || workspace === 'default';

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Senior Software Engineer');
  const [specialty, setSpecialty] = useState('Distributed Systems');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].src);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [sendGmail, setSendGmail] = useState(true);
  const [inviteMethod, setInviteMethod] = useState('gmail'); // 'gmail' | 'mailto'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Dispatched Invitation Confirmation Modal State
  const [inviteSentData, setInviteSentData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef(null);

  // Helper to ensure clean vector avatars instead of old AI photos
  const sanitizeAvatar = (url, index = 0) => {
    if (!url || url.includes('images.unsplash.com')) {
      return AVATAR_PRESETS[index % AVATAR_PRESETS.length].src;
    }
    return url;
  };

  // Fallback if teamMembers is empty
  const membersToDisplay = teamMembers && teamMembers.length > 0
    ? teamMembers
    : [
        {
          id: user?.id || 'user_owner',
          name: user?.name || 'Justin',
          role: user?.role || 'Workspace Owner',
          email: user?.email || 'justin@company.com',
          avatar: DEFAULT_AVATAR,
          initials: user?.initials || 'JU',
          color: 'bg-brand-600',
          contributions: 0,
          memoriesLogged: 0,
          conflictsResolved: 0,
          queriesRun: 0,
          status: 'online',
          badges: ['Workspace Creator', 'Core Engineer']
        }
      ];

  const filteredMembers = membersToDisplay.filter((m) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.badges?.some(b => b.toLowerCase().includes(q))
    );
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.warning('File Too Large', 'Please select an image smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPhoto(reader.result);
      setSelectedAvatar(reader.result);
      toast.success('Photo Loaded', 'Custom photo ready for teammate profile.');
    };
    reader.readAsDataURL(file);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Please enter the teammate full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Validation Error', 'Please enter a valid work email.');
      return;
    }

    if (!workspace) {
      toast.warning('No Workspace', 'Please create or select an active workspace first.');
      openCreateWorkspaceModal();
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      // 1. Add teammate to workspace state & localStorage
      await addTeamMember({
        name: trimmedName,
        email: trimmedEmail,
        role,
        specialty,
        avatar: selectedAvatar,
        status: 'online'
      });

      // 2. Prepare & send invitation details
      const inviteDetails = generateInviteDetails({
        recipientName: trimmedName,
        recipientEmail: trimmedEmail,
        recipientRole: role,
        specialty,
        workspaceName: currentWorkspace?.name || workspace,
        workspaceId: workspace,
        inviterName: user?.name || 'Engineering Lead',
        inviterRole: user?.role || 'Team Lead'
      });

      if (sendGmail) {
        if (inviteMethod === 'gmail') {
          // Open direct Gmail compose window
          sendGmailInvite({
            recipientName: trimmedName,
            recipientEmail: trimmedEmail,
            recipientRole: role,
            specialty,
            workspaceName: currentWorkspace?.name || workspace,
            workspaceId: workspace,
            inviterName: user?.name || 'Engineering Lead',
            inviterRole: user?.role || 'Team Lead'
          });
          toast.success('Gmail Compose Opened', `Pre-filled workspace invitation opened for ${trimmedEmail}.`);
        } else {
          // Open default mail client
          sendMailtoInvite({
            recipientName: trimmedName,
            recipientEmail: trimmedEmail,
            recipientRole: role,
            specialty,
            workspaceName: currentWorkspace?.name || workspace,
            workspaceId: workspace,
            inviterName: user?.name || 'Engineering Lead',
            inviterRole: user?.role || 'Team Lead'
          });
          toast.success('Email Client Opened', `Pre-filled invitation for ${trimmedEmail}.`);
        }

        // Show confirmation popup
        setInviteSentData(inviteDetails);
      } else {
        toast.success('Teammate Added', `${trimmedName} added to ${currentWorkspace?.name || workspace}.`);
      }

      // Reset and close invite form
      setName('');
      setEmail('');
      setSpecialty('Distributed Systems');
      setSelectedAvatar(AVATAR_PRESETS[0].src);
      setUploadedPhoto(null);
      setIsInviteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to Add Teammate', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendGmailToMember = (member) => {
    const inviteDetails = generateInviteDetails({
      recipientName: member.name,
      recipientEmail: member.email,
      recipientRole: member.role,
      specialty: member.specialty || member.role,
      workspaceName: currentWorkspace?.name || workspace,
      workspaceId: workspace,
      inviterName: user?.name || 'Engineering Lead',
      inviterRole: user?.role || 'Team Lead'
    });

    sendGmailInvite({
      recipientName: member.name,
      recipientEmail: member.email,
      recipientRole: member.role,
      specialty: member.specialty || member.role,
      workspaceName: currentWorkspace?.name || workspace,
      workspaceId: workspace,
      inviterName: user?.name || 'Engineering Lead',
      inviterRole: user?.role || 'Team Lead'
    });

    setInviteSentData(inviteDetails);
    toast.success('Gmail Compose Opened', `Workspace invitation pre-filled for ${member.name} (${member.email}).`);
  };

  const handleCopyInvite = (details) => {
    if (!details) return;
    const textToCopy = `KnowBridge Workspace Invitation\n\n${details.body}\n\nJoin Link: ${details.inviteUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    toast.info('Copied to Clipboard', 'Full invitation message and join link copied.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRemove = async (member) => {
    if (member.id === user?.id) {
      toast.warning('Action Blocked', 'You cannot remove yourself from your own workspace.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${member.name} from this workspace?`)) {
      await removeTeamMember(member.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-brand-50 text-brand-700 border border-brand-200">
              <span>Workspace: {currentWorkspace?.name || workspace || 'No Workspace'}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({membersToDisplay.length} {membersToDisplay.length === 1 ? 'member' : 'members'})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Engineering Team & Ownership
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Engineers collaborating across architecture rules, decision logging, and conflict resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search engineers..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-40 sm:w-48"
            />
          </div>

          <button
            onClick={() => {
              setIsInviteModalOpen(true);
              setSelectedAvatar(AVATAR_PRESETS[membersToDisplay.length % AVATAR_PRESETS.length].src);
              setUploadedPhoto(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-subtle flex-shrink-0 active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Teammate</span>
          </button>
        </div>
      </div>

      {/* 2. Team Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member, index) => {
          const isCurrentUser = user?.id === member.id;
          const displayAvatar = sanitizeAvatar(member.avatar, index);

          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isCurrentUser
                  ? 'border-brand-300 ring-2 ring-brand-500/10 shadow-card'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-card hover:shadow-card-hover'
              }`}
            >
              <div>
                {/* Avatar & Status Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={displayAvatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-slate-50"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        member.status === 'online'
                          ? 'bg-emerald-500'
                          : member.status === 'in-meeting'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      title={`Status: ${member.status}`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCurrentUser ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                        You
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => switchPersona(member.id)}
                          title="Simulate session as this engineer"
                          className="text-[11px] text-slate-500 hover:text-brand-600 font-medium px-2 py-0.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                        >
                          Simulate
                        </button>
                        <button
                          onClick={() => handleRemove(member)}
                          title="Remove teammate from workspace"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {member.name}
                </h3>
                <span className="text-xs text-brand-700 font-medium block mt-0.5">
                  {member.role}
                </span>

                {/* Email & Gmail Invite Button */}
                <div className="flex items-center justify-between mt-1 pt-1">
                  <span className="text-xs text-slate-400 truncate font-mono">
                    {member.email}
                  </span>
                  {!isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => handleSendGmailToMember(member)}
                      title="Send or resend Gmail invitation"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-0.5 rounded-lg transition-colors flex-shrink-0 ml-2"
                    >
                      <Mail className="w-3 h-3 text-brand-600" />
                      <span>Gmail Invite</span>
                    </button>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {member.badges?.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="block font-bold text-slate-900">
                    {member.memoriesLogged || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Decisions</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="block font-bold text-slate-900">
                    {member.conflictsResolved || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Resolved</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="block font-bold text-slate-900">
                    {member.queriesRun || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Searches</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <p className="text-sm font-semibold">No engineers match "{searchFilter}"</p>
          <button
            onClick={() => setSearchFilter('')}
            className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* 3. Add Teammate Modal with Gmail Dispatch Integration */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-dropdown p-6 animate-slide-up relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add Teammate to Workspace
                  </h3>
                  <span className="text-[11px] text-slate-500 block">
                    Workspace: {currentWorkspace?.name || workspace}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              
              {/* Avatar Selector: 6 Vector Options OR Camera/File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Profile Avatar or Upload Photo
                </label>

                {/* 6 Clean Vector Presets */}
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatar === preset.src && !uploadedPhoto;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(preset.src);
                          setUploadedPhoto(null);
                        }}
                        title={preset.name}
                        className={`relative rounded-2xl p-0.5 border-2 transition-all ${
                          isSelected
                            ? 'border-brand-600 ring-2 ring-brand-500/20 scale-105 shadow-sm bg-brand-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={preset.src}
                          alt={preset.name}
                          className="w-10 h-10 rounded-xl object-cover mx-auto"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Camera / Custom File Upload Container */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedPhoto ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={uploadedPhoto}
                          alt="Custom upload"
                          className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Custom Photo Active
                          </span>
                          <span className="text-[10px] text-slate-500">Camera / Photo selected</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedPhoto(null);
                            setSelectedAvatar(AVATAR_PRESETS[0].src);
                          }}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/40 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-brand-600" />
                      <span>Take Photo with Camera or Upload Image</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Engineer Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email (Recipient) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Engineering Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Engineering Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                  <option value="Staff Systems Architect">Staff Systems Architect</option>
                  <option value="DevOps & SRE Specialist">DevOps & SRE Specialist</option>
                  <option value="Frontend & UI/UX Specialist">Frontend & UI/UX Specialist</option>
                  <option value="Data & ML Infrastructure Lead">Data & ML Infrastructure Lead</option>
                  <option value="Security & Compliance Engineer">Security & Compliance Engineer</option>
                </select>
              </div>

              {/* Technical Specialty / Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Technical Specialty
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems, PostgreSQL, Kubernetes"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Gmail / Email Invitation Delivery Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendGmail}
                      onChange={(e) => setSendGmail(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-600" />
                      Send Gmail Invitation on Add
                    </span>
                  </label>
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                {sendGmail && (
                  <div className="space-y-2 pt-1 border-t border-indigo-100">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Opens an official Gmail draft with recipient email, subject, and direct workspace link ready to send.
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="inviteMethod"
                          value="gmail"
                          checked={inviteMethod === 'gmail'}
                          onChange={() => setInviteMethod('gmail')}
                          className="w-3.5 h-3.5 text-brand-600"
                        />
                        <span className="text-slate-800 font-medium">Google Gmail Web Compose</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="inviteMethod"
                          value="mailto"
                          checked={inviteMethod === 'mailto'}
                          onChange={() => setInviteMethod('mailto')}
                          className="w-3.5 h-3.5 text-brand-600"
                        />
                        <span className="text-slate-800 font-medium">Default Mail (mailto)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      {sendGmail ? <Send className="w-3.5 h-3.5" /> : <UserPlus className="w-4 h-4" />}
                      <span>{sendGmail ? 'Add & Send Gmail Invite' : 'Add Teammate'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Invitation Dispatched Confirmation & Link Copier Modal */}
      {inviteSentData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-dropdown p-6 animate-slide-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Gmail Invitation Dispatched!
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Pre-filled invitation prepared for <strong>{inviteSentData.recipientEmail}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInviteSentData(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Preview Details */}
            <div className="space-y-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Recipient:</span>
                  <span className="font-mono text-slate-900 font-bold">{inviteSentData.recipientName} ({inviteSentData.recipientEmail})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Subject:</span>
                  <span className="text-slate-800 truncate max-w-[260px] font-medium">{inviteSentData.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Workspace:</span>
                  <span className="font-bold text-brand-700">{inviteSentData.workspaceName}</span>
                </div>
              </div>

              {/* Invitation Link Box with Copy Button */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Direct Invitation Join Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteSentData.inviteUrl}
                    className="flex-1 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(inviteSentData)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-subtle flex-shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={inviteSentData.gmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-colors flex-1 sm:flex-none"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Gmail Tab</span>
                </a>
                <a
                  href={inviteSentData.mailtoUrl}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex-1 sm:flex-none"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Open Mail App</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setInviteSentData(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
