// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links - FIXED
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only process if href is not just "#"
            if (href && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Cloud falling animation
    const cloudsContainer = document.getElementById('clouds-container');
    let lastCloudTime = 0;
    const cloudInterval = 150;

    if (cloudsContainer) {
        document.addEventListener('mousemove', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastCloudTime >= cloudInterval) {
                createCloud(e.clientX);
                lastCloudTime = currentTime;
            }
        });
    }

    function createCloud(x) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        
        const cloudTypes = ['☁️', '☁', '🌥️'];
        cloud.textContent = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
        
        cloud.style.left = (x - 25) + 'px';
        cloud.style.top = '-100px';
        
        const randomOffset = (Math.random() - 0.5) * 50;
        cloud.style.left = (x - 25 + randomOffset) + 'px';
        
        cloudsContainer.appendChild(cloud);

        setTimeout(() => {
            cloud.remove();
        }, 3000);
    }

    // Modal functionality
    const userLoginBtn = document.getElementById('userLoginBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const userLoginModal = document.getElementById('userLoginModal');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const registrationModal = document.getElementById('registrationModal');
    const closeBtns = document.querySelectorAll('.close');

    if (userLoginBtn && userLoginModal) {
        userLoginBtn.addEventListener('click', () => {
            userLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (adminLoginBtn && adminLoginModal) {
        adminLoginBtn.addEventListener('click', () => {
            adminLoginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // USER LOGIN
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = userLoginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;
            const userType = document.querySelector('input[name="loginUserType"]:checked').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, userType })
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect;
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // ADMIN LOGIN
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            const adminId = document.getElementById('adminId').value.trim();
            const password = document.getElementById('adminPassword').value;
            
            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminId, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect;
                } else {
                    alert(data.message || 'Invalid admin credentials.');
                }
            } catch (error) {
                console.error('Admin login error:', error);
                alert('An error occurred during login. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // Registration Modal
    const openRegisterModal = document.getElementById('openRegisterModal');
    
    if (openRegisterModal && userLoginModal && registrationModal) {
        openRegisterModal.addEventListener('click', (e) => {
            e.preventDefault();
            userLoginModal.style.display = 'none';
            registrationModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    const backToLogin = document.getElementById('backToLogin');
    if (backToLogin && registrationModal && userLoginModal) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registrationModal.style.display = 'none';
            userLoginModal.style.display = 'block';
        });
    }

    // Registration type selection - FIXED to handle required fields
    const donorRadio = document.getElementById('donorRadio');
    const recipientRadio = document.getElementById('recipientRadio');
    const donorFields = document.getElementById('donorFields');
    const recipientFields = document.getElementById('recipientFields');

    function toggleRequiredFields() {
        if (donorRadio && donorRadio.checked && donorFields && recipientFields) {
            donorFields.style.display = 'block';
            recipientFields.style.display = 'none';
            
            // Make donor fields required, remove required from recipient fields
            donorFields.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                field.required = true;
            });
            recipientFields.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                field.required = false;
            });
        } else if (recipientRadio && recipientRadio.checked && donorFields && recipientFields) {
            donorFields.style.display = 'none';
            recipientFields.style.display = 'block';
            
            // Make recipient fields required, remove required from donor fields
            recipientFields.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                field.required = true;
            });
            donorFields.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
                field.required = false;
            });
        }
    }

    if (donorRadio && recipientRadio) {
        donorRadio.addEventListener('change', toggleRequiredFields);
        recipientRadio.addEventListener('change', toggleRequiredFields);
        
        // Initialize on page load
        toggleRequiredFields();
    }

    // REGISTRATION FORM - COMPLETELY FIXED
    const registrationForm = document.getElementById('registrationForm');
    
    if (registrationForm) {
        console.log('✅ Registration form found and listener attached');
        
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📝 Registration form submitted');
            
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            if (!submitBtn) {
                console.error('❌ Submit button not found');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
            
            try {
                // Determine user type
                const userType = donorRadio && donorRadio.checked ? 'donor' : 'recipient';
                console.log('👤 User type:', userType);
                
                // Get ALL inputs from the form
                const allInputs = registrationForm.querySelectorAll('input, select, textarea');
                console.log('📋 Total form elements found:', allInputs.length);
                
                // Create registration data object
                const registrationData = {
                    userType: userType
                };

                // Process each form element
                allInputs.forEach((element, index) => {
                    const name = element.name;
                    const placeholder = element.placeholder;
                    const type = element.type;
                    const value = element.value;
                    
                    // Skip hidden fields
                    if (element.offsetParent === null && element.type !== 'radio' && element.type !== 'checkbox') {
                        return;
                    }
                    
                    // Map fields based on placeholder or type
                    if (placeholder) {
                        if (placeholder.includes('Full Name')) {
                            registrationData.fullName = value.trim();
                        } else if (placeholder.includes('Email Address')) {
                            registrationData.email = value.trim();
                        } else if (placeholder.includes('Phone Number')) {
                            registrationData.phone = value.trim();
                        } else if (placeholder.includes('Address') && !placeholder.includes('Hospital')) {
                            registrationData.address = value.trim();
                        } else if (placeholder.includes('City')) {
                            registrationData.city = value.trim();
                        } else if (placeholder.includes('State')) {
                            registrationData.state = value.trim();
                        } else if (placeholder.includes('PIN Code')) {
                            registrationData.pinCode = value.trim();
                        } else if (placeholder.includes('Password') && !placeholder.includes('Confirm')) {
                            registrationData.password = value;
                        }
                        // Donor specific
                        else if (placeholder.includes('Weight')) {
                            registrationData.weight = parseInt(value);
                        }
                        // Recipient specific
                        else if (placeholder.includes('Units Required')) {
                            registrationData.unitsRequired = parseInt(value);
                        } else if (placeholder.includes('Hospital Name')) {
                            registrationData.hospitalName = value.trim();
                        } else if (placeholder.includes('Hospital Address')) {
                            registrationData.hospitalAddress = value.trim();
                        } else if (placeholder.includes('Doctor Name')) {
                            registrationData.doctorName = value.trim();
                        } else if (placeholder.includes('Emergency Contact Number')) {
                            registrationData.emergencyContactNumber = value.trim();
                        } else if (placeholder.includes('Medical Condition')) {
                            registrationData.medicalCondition = value.trim();
                        }
                    }
                    
                    // Handle date input
                    if (type === 'date' && value) {
                        registrationData.dateOfBirth = value;
                    }
                    
                    // Handle selects
                    if (element.tagName === 'SELECT' && element.selectedIndex > 0) {
                        const firstOption = element.options[0].text;
                        if (firstOption.includes('Gender')) {
                            registrationData.gender = value;
                        } else if (firstOption.includes('Blood Group')) {
                            registrationData.bloodGroup = value;
                        } else if (firstOption.includes('Last Donation')) {
                            registrationData.lastDonation = value;
                        } else if (firstOption.includes('Urgency')) {
                            registrationData.urgencyLevel = value;
                        }
                    }
                    
                    // Handle checkboxes
                    if (type === 'checkbox' && element.checked) {
                        const labelText = element.parentElement ? element.parentElement.textContent : '';
                        if (labelText.includes('chronic diseases')) {
                            registrationData.noDiseases = true;
                        } else if (labelText.includes('medication')) {
                            registrationData.noMedication = true;
                        } else if (labelText.includes('emergency donations')) {
                            registrationData.emergencyContact = true;
                        }
                    }
                    
                    // Handle textarea
                    if (element.tagName === 'TEXTAREA' && value) {
                        registrationData.medicalCondition = value.trim();
                    }
                });

                console.log('📊 Collected data:', registrationData);

                // Validate required common fields
                if (!registrationData.fullName) {
                    alert('Please enter your full name');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.email) {
                    alert('Please enter your email address');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.phone) {
                    alert('Please enter your phone number');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.dateOfBirth) {
                    alert('Please enter your date of birth');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.gender) {
                    alert('Please select your gender');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.bloodGroup) {
                    alert('Please select your blood group');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.address) {
                    alert('Please enter your address');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.city) {
                    alert('Please enter your city');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.state) {
                    alert('Please enter your state');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.pinCode) {
                    alert('Please enter your PIN code');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }
                
                if (!registrationData.password) {
                    alert('Please enter a password');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                    return;
                }

                // Type-specific validation
                if (userType === 'donor') {
                    if (!registrationData.weight || registrationData.weight < 45) {
                        alert('Donor weight must be at least 45 kg');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.lastDonation) {
                        alert('Please select when you last donated');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                } else {
                    if (!registrationData.urgencyLevel) {
                        alert('Please select urgency level');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.unitsRequired) {
                        alert('Please enter units required');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.hospitalName) {
                        alert('Please enter hospital name');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.hospitalAddress) {
                        alert('Please enter hospital address');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.medicalCondition) {
                        alert('Please enter medical condition');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                    if (!registrationData.emergencyContactNumber) {
                        alert('Please enter emergency contact number');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Complete Registration';
                        return;
                    }
                }

                console.log('✅ Validation passed, sending to server...');

                // Submit to backend
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                });

                const result = await response.json();
                console.log('📬 Server response:', result);

                if (result.success) {
                    alert('✅ ' + result.message);
                    registrationForm.reset();
                    registrationModal.style.display = 'none';
                    userLoginModal.style.display = 'block';
                    if (donorFields) donorFields.style.display = 'block';
                    if (recipientFields) recipientFields.style.display = 'none';
                    if (donorRadio) donorRadio.checked = true;
                    toggleRequiredFields();
                } else {
                    alert('❌ ' + (result.message || 'Registration failed. Please try again.'));
                }
            } catch (error) {
                console.error('❌ Registration error:', error);
                alert('An error occurred during registration. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Complete Registration';
            }
        });
    } else {
        console.error('❌ Registration form NOT found in DOM');
    }

    // Other event listeners...
    const getStartedBtn = document.querySelector('.btn-hero');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const featuresSection = document.querySelector('#features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    console.log('%c ✅ CherryClouds Loaded Successfully! ', 'background: #6366f1; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary-color) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(8px, -8px);
    }
`;
document.head.appendChild(style);