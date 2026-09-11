import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Validation Error', 'Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast('Message Sent Successfully', 'Thank you for reaching out! Our support team will get back to you within 24 hours.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Contact EduNexus Support & Sales"
        description="Get in touch with the EduNexus team for course inquiries, enterprise licensing, or technical support."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Get In Touch</span>
              <h2 className="text-2xl font-extrabold text-white mt-1 mb-4">Contact Info</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-8">
                Have questions regarding team access, custom learning pathways, or technical support? Reach out anytime.
              </p>

              <div className="space-y-6 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">Email Support</span>
                    <span className="font-bold text-white">support@ednexus.edu</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">Direct Toll-Free</span>
                    <span className="font-bold text-white">+1 (800) 555-EDTECH</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">Headquarters</span>
                    <span className="font-bold text-white">San Francisco, CA 94105</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400">
              Response time: Under 24 business hours.
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">Send Us a Message</h1>
              <p className="text-xs text-slate-500 mt-1">Fill out the form below and our team will be in touch shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Your Full Name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email Address" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <Input label="Subject / Topic" placeholder="e.g. Enterprise Team Licensing Inquiry" value={subject} onChange={(e) => setSubject(e.target.value)} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Your Message *</label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>

              <Button type="submit" variant="default" disabled={isSubmitting} className="gap-2 font-bold px-6">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
