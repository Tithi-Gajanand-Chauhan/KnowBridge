/**
 * Gmail & Email Invitation Service for KnowBridge
 * Pre-composes official workspace invitations for Gmail Web Compose & mailto clients.
 */

export const generateInviteDetails = ({
  recipientName,
  recipientEmail,
  recipientRole = 'Software Engineer',
  specialty = 'General Engineering',
  workspaceName = 'Engineering Workspace',
  workspaceId = 'default',
  inviterName = 'Engineering Lead',
  inviterRole = 'Team Lead'
}) => {
  const origin = window.location.origin;
  const inviteUrl = `${origin}/register?workspace=${encodeURIComponent(workspaceId)}&email=${encodeURIComponent(recipientEmail)}&name=${encodeURIComponent(recipientName)}&role=${encodeURIComponent(recipientRole)}`;

  const subject = `[KnowBridge] ${inviterName} invited you to join "${workspaceName}" workspace`;

  const body = `Hi ${recipientName || 'there'},

${inviterName} (${inviterRole}) has invited you to collaborate in the "${workspaceName}" workspace on KnowBridge!

KnowBridge is our team's Continuous Shared Memory platform. We use it to autonomously capture architectural decisions from chat & PRs, intercept contradictions before merging, and ground team questions in verified system rules.

Workspace Details:
• Workspace: ${workspaceName}
• Assigned Role: ${recipientRole}
• Technical Domain / Specialty: ${specialty || 'General Engineering'}
• Invited by: ${inviterName}

Click the link below to accept your invitation and join the workspace:
${inviteUrl}

Once joined, you will have instant access to our active decisions, system rules, and AI architectural search copilot.

Best regards,
${inviterName}
KnowBridge Continuous Shared Memory Platform
${origin}`;

  // Direct Google Gmail Web Compose URL (opens Gmail tab with prefilled To, Subject, Body)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Default desktop/mobile mail client fallback
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    recipientName,
    recipientEmail,
    recipientRole,
    specialty,
    workspaceName,
    workspaceId,
    inviterName,
    inviterRole,
    subject,
    body,
    inviteUrl,
    gmailUrl,
    mailtoUrl
  };
};

export const sendGmailInvite = (params) => {
  const details = generateInviteDetails(params);
  const opened = window.open(details.gmailUrl, '_blank', 'noopener,noreferrer');
  return {
    ...details,
    openedSuccessfully: !!opened
  };
};

export const sendMailtoInvite = (params) => {
  const details = generateInviteDetails(params);
  window.location.href = details.mailtoUrl;
  return details;
};
