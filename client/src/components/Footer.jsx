import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <motion.footer 
            className="bg-gradient-to-r from-black via-gray-900 to-black shadow-xl border-t border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white mb-4">
                            Augenblick
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Transform your ideas into compelling content with our powerful editing suite.
                        </p>
                        <div className="flex space-x-4">
                            {['twitter', 'github', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`https://${social}.com`}
                                    className="w-10 h-10 bg-gray-800 text-gray-400 rounded-lg flex items-center justify-center hover:text-white hover:scale-105 transition-all duration-300"
                                >
                                    <span className="sr-only">{social}</span>
                                    {/* You can add social icons here */}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {['Features', 'Pricing', 'Documentation', 'Releases'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105 flex items-center">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105 flex items-center">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Augenblick. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-sm text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}