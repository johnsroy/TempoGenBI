import { Mail } from "lucide-react";

export default function SMTPMessage() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Mail className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-700">
            Custom SMTP Configuration
          </h3>
          <p className="text-blue-600 text-sm mt-1">
            This application uses a custom SMTP server for sending
            authentication emails. If you're not receiving emails, please
            contact the administrator to verify the SMTP configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
