import requests
import sys
import json
from datetime import datetime
import time

class SuerteAppTester:
    def __init__(self, base_url="https://ventana-proyecto.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_email = f"test_{datetime.now().strftime('%H%M%S')}@test.com"
        self.admin_email = "vimaro16+5@gmail.com"  # Given admin email
        self.test_password = "TestPass123!"
        self.reset_token = None

    def log_result(self, test_name, success, details="", endpoint=""):
        """Log test result"""
        result = {
            "test": test_name,
            "endpoint": endpoint,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.tests_run += 1

    def make_request(self, method, endpoint, data=None, headers=None, expected_status=None, timeout=30):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)
            else:
                return False, {"error": "Invalid method"}

            # Check expected status
            if expected_status and response.status_code != expected_status:
                return False, {
                    "status_code": response.status_code,
                    "expected": expected_status,
                    "response": response.text[:500]
                }
            
            try:
                return True, response.json()
            except:
                return True, {"status_code": response.status_code, "content": response.text[:500]}
                
        except requests.exceptions.Timeout:
            return False, {"error": "Request timeout"}
        except Exception as e:
            return False, {"error": str(e)}

    def setup_admin_user(self):
        """Setup admin user for testing"""
        print("\n🔧 Setting up admin user...")
        
        # Try to login with admin credentials (user should exist from setup)
        success, response = self.make_request('POST', 'auth/login', {
            "email": self.admin_email,
            "password": "admin123"  # Common default admin password
        })
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            self.log_result("Admin Login", True, endpoint="POST /api/auth/login")
            return True
        
        # If admin doesn't exist or wrong password, try to register first admin
        print("Admin login failed, trying to register...")
        success, response = self.make_request('POST', 'auth/register', {
            "full_name": "Admin Test",
            "cedula": "12345678",
            "whatsapp": "+573001234567",
            "email": self.admin_email,
            "password": "admin123"
        })
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            self.log_result("Admin Registration", True, endpoint="POST /api/auth/register")
            return True
        
        self.log_result("Admin Setup", False, "Could not setup admin user")
        return False

    def test_forgot_password(self):
        """Test forgot password endpoint"""
        print("\n📧 Testing Forgot Password...")
        
        # Test with valid email
        success, response = self.make_request('POST', 'auth/forgot-password', {
            "email": self.admin_email
        })
        
        if success:
            self.log_result("Forgot Password - Valid Email", True, 
                          f"Response: {response.get('message', 'Success')}", 
                          "POST /api/auth/forgot-password")
        else:
            self.log_result("Forgot Password - Valid Email", False, 
                          f"Failed: {response}", 
                          "POST /api/auth/forgot-password")
        
        # Test with invalid email format
        success, response = self.make_request('POST', 'auth/forgot-password', {
            "email": "invalid-email"
        })
        
        # Should return error for invalid email format
        if not success or response.get('detail'):
            self.log_result("Forgot Password - Invalid Email Format", True, 
                          "Correctly rejected invalid email", 
                          "POST /api/auth/forgot-password")
        else:
            self.log_result("Forgot Password - Invalid Email Format", False, 
                          "Should reject invalid email format", 
                          "POST /api/auth/forgot-password")

    def test_reset_password(self):
        """Test reset password endpoint (with dummy token)"""
        print("\n🔑 Testing Reset Password...")
        
        # Test with invalid token
        success, response = self.make_request('POST', 'auth/reset-password', {
            "token": "invalid-token-123",
            "new_password": "NewPassword123!"
        })
        
        if not success or 'error' in str(response).lower() or 'invalid' in str(response).lower():
            self.log_result("Reset Password - Invalid Token", True, 
                          "Correctly rejected invalid token", 
                          "POST /api/auth/reset-password")
        else:
            self.log_result("Reset Password - Invalid Token", False, 
                          "Should reject invalid token", 
                          "POST /api/auth/reset-password")
        
        # Test with empty password
        success, response = self.make_request('POST', 'auth/reset-password', {
            "token": "dummy-token",
            "new_password": ""
        })
        
        if not success or 'error' in str(response).lower():
            self.log_result("Reset Password - Empty Password", True, 
                          "Correctly rejected empty password", 
                          "POST /api/auth/reset-password")
        else:
            self.log_result("Reset Password - Empty Password", False, 
                          "Should reject empty password", 
                          "POST /api/auth/reset-password")

    def test_user_editing(self):
        """Test complete user editing by admin"""
        print("\n👤 Testing User Editing...")
        
        if not self.admin_token:
            self.log_result("User Editing", False, "No admin token available")
            return
        
        # First, create a test user to edit
        success, response = self.make_request('POST', 'auth/register', {
            "full_name": "Test User Edit",
            "cedula": "87654321",
            "whatsapp": "+573009876543",
            "email": f"edit_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": self.test_password
        })
        
        if not success:
            self.log_result("User Editing - Create Test User", False, "Could not create test user")
            return
        
        test_user_id = response['user']['id']
        
        # Test editing user information
        headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
        success, response = self.make_request('PUT', f'users/{test_user_id}', {
            "full_name": "Updated Test User",
            "email": f"updated_{datetime.now().strftime('%H%M%S')}@test.com",
            "whatsapp": "+573001111111",
            "cedula": "11111111",
            "role": "editor"
        }, headers=headers)
        
        if success and response.get('full_name') == "Updated Test User":
            self.log_result("User Editing - Update User Info", True, 
                          "Successfully updated user information", 
                          f"PUT /api/users/{test_user_id}")
        else:
            self.log_result("User Editing - Update User Info", False, 
                          f"Failed to update: {response}", 
                          f"PUT /api/users/{test_user_id}")
        
        # Test editing non-existent user
        success, response = self.make_request('PUT', 'users/non-existent-id', {
            "full_name": "Should Fail"
        }, headers=headers)
        
        if not success or response.get('detail'):
            self.log_result("User Editing - Non-existent User", True, 
                          "Correctly rejected non-existent user", 
                          "PUT /api/users/non-existent-id")
        else:
            self.log_result("User Editing - Non-existent User", False, 
                          "Should reject non-existent user", 
                          "PUT /api/users/non-existent-id")

    def test_reports_generation(self):
        """Test report generation endpoints"""
        print("\n📊 Testing Reports Generation...")
        
        if not self.admin_token:
            self.log_result("Reports Generation", False, "No admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test Excel report generation
        try:
            url = f"{self.base_url}/reports/excel"
            response = requests.get(url, headers=headers, timeout=60)  # Longer timeout for file generation
            
            if response.status_code == 200 and 'application/' in response.headers.get('content-type', ''):
                self.log_result("Excel Report Generation", True, 
                              f"File size: {len(response.content)} bytes", 
                              "GET /api/reports/excel")
            else:
                self.log_result("Excel Report Generation", False, 
                              f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}", 
                              "GET /api/reports/excel")
        except Exception as e:
            self.log_result("Excel Report Generation", False, 
                          f"Exception: {str(e)}", 
                          "GET /api/reports/excel")
        
        # Test PDF report generation
        try:
            url = f"{self.base_url}/reports/pdf"
            response = requests.get(url, headers=headers, timeout=60)
            
            if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                self.log_result("PDF Report Generation", True, 
                              f"File size: {len(response.content)} bytes", 
                              "GET /api/reports/pdf")
            else:
                self.log_result("PDF Report Generation", False, 
                              f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}", 
                              "GET /api/reports/pdf")
        except Exception as e:
            self.log_result("PDF Report Generation", False, 
                          f"Exception: {str(e)}", 
                          "GET /api/reports/pdf")

    def test_report_history(self):
        """Test report history endpoint"""
        print("\n📋 Testing Report History...")
        
        if not self.admin_token:
            self.log_result("Report History", False, "No admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
        success, response = self.make_request('GET', 'reports/history', headers=headers)
        
        if success and isinstance(response, list):
            self.log_result("Report History", True, 
                          f"Found {len(response)} report records", 
                          "GET /api/reports/history")
        else:
            self.log_result("Report History", False, 
                          f"Expected list, got: {type(response)}", 
                          "GET /api/reports/history")

    def test_frontend_content_cms(self):
        """Test frontend content CMS endpoints"""
        print("\n🎨 Testing Frontend Content CMS...")
        
        # Test getting frontend content (public endpoint)
        success, response = self.make_request('GET', 'frontend/content')
        
        if success and 'hero_title' in response:
            self.log_result("Get Frontend Content", True, 
                          f"Got content with hero_title: {response.get('hero_title', '')[:50]}", 
                          "GET /api/frontend/content")
        else:
            self.log_result("Get Frontend Content", False, 
                          f"Missing expected fields: {response}", 
                          "GET /api/frontend/content")
        
        # Test updating content (admin only)
        if self.admin_token:
            headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
            success, response = self.make_request('PUT', 'frontend/content', {
                "hero_title": "Test Updated Title",
                "feature1_title": "Test Feature Update"
            }, headers=headers)
            
            if success and response.get('message'):
                self.log_result("Update Frontend Content", True, 
                              f"Response: {response.get('message')}", 
                              "PUT /api/frontend/content")
            else:
                self.log_result("Update Frontend Content", False, 
                              f"Failed: {response}", 
                              "PUT /api/frontend/content")

    def test_social_sharing(self):
        """Test social sharing with sponsor code"""
        print("\n📱 Testing Social Sharing...")
        
        if not self.admin_token:
            self.log_result("Social Sharing", False, "No admin token for testing")
            return
        
        # First get available raffles
        success, raffles = self.make_request('GET', 'raffles')
        
        if not success or not raffles:
            self.log_result("Social Sharing - Get Raffles", False, "No raffles available for testing")
            return
        
        raffle_id = raffles[0]['id'] if raffles else None
        if not raffle_id:
            self.log_result("Social Sharing - No Raffle ID", False, "Could not get raffle ID")
            return
        
        # Test getting share links
        headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
        success, response = self.make_request('GET', f'raffles/{raffle_id}/share', headers=headers)
        
        if success and 'facebook' in response and 'sponsor_code' in response:
            self.log_result("Social Sharing - Get Share Links", True, 
                          f"Got share links with sponsor_code: {response.get('sponsor_code')}", 
                          f"GET /api/raffles/{raffle_id}/share")
        else:
            self.log_result("Social Sharing - Get Share Links", False, 
                          f"Missing expected fields: {response}", 
                          f"GET /api/raffles/{raffle_id}/share")

    def test_advanced_sponsor_metrics(self):
        """Test advanced sponsor metrics endpoints"""
        print("\n💰 Testing Advanced Sponsor Metrics...")
        
        if not self.admin_token:
            self.log_result("Sponsor Metrics", False, "No admin token for testing")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
        
        # Test earnings by raffle
        success, response = self.make_request('GET', 'sponsor/earnings-by-raffle', headers=headers)
        
        if success and isinstance(response, list):
            self.log_result("Sponsor Metrics - By Raffle", True, 
                          f"Got {len(response)} raffle earnings records", 
                          "GET /api/sponsor/earnings-by-raffle")
        else:
            self.log_result("Sponsor Metrics - By Raffle", False, 
                          f"Expected list, got: {response}", 
                          "GET /api/sponsor/earnings-by-raffle")
        
        # Test earnings by week
        success, response = self.make_request('GET', 'sponsor/earnings-by-week', headers=headers)
        
        if success and isinstance(response, list):
            self.log_result("Sponsor Metrics - By Week", True, 
                          f"Got {len(response)} weekly earnings records", 
                          "GET /api/sponsor/earnings-by-week")
        else:
            self.log_result("Sponsor Metrics - By Week", False, 
                          f"Expected list, got: {response}", 
                          "GET /api/sponsor/earnings-by-week")
        
        # Test earnings by month
        success, response = self.make_request('GET', 'sponsor/earnings-by-month', headers=headers)
        
        if success and isinstance(response, list):
            self.log_result("Sponsor Metrics - By Month", True, 
                          f"Got {len(response)} monthly earnings records", 
                          "GET /api/sponsor/earnings-by-month")
        else:
            self.log_result("Sponsor Metrics - By Month", False, 
                          f"Expected list, got: {response}", 
                          "GET /api/sponsor/earnings-by-month")

    def test_top_buyer(self):
        """Test top buyer endpoint"""
        print("\n🏆 Testing Top Buyer...")
        
        # Get raffles first
        success, raffles = self.make_request('GET', 'raffles')
        
        if not success or not raffles:
            self.log_result("Top Buyer - Get Raffles", False, "No raffles available")
            return
        
        raffle_id = raffles[0]['id']
        success, response = self.make_request('GET', f'raffles/{raffle_id}/top-buyer')
        
        if success:
            if response is None:
                self.log_result("Top Buyer", True, 
                              "No top buyer yet (expected for new raffles)", 
                              f"GET /api/raffles/{raffle_id}/top-buyer")
            elif 'user_name' in response:
                self.log_result("Top Buyer", True, 
                              f"Found top buyer: {response.get('user_name')}", 
                              f"GET /api/raffles/{raffle_id}/top-buyer")
            else:
                self.log_result("Top Buyer", False, 
                              f"Unexpected response format: {response}", 
                              f"GET /api/raffles/{raffle_id}/top-buyer")
        else:
            self.log_result("Top Buyer", False, 
                          f"Request failed: {response}", 
                          f"GET /api/raffles/{raffle_id}/top-buyer")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting SuerteApp Backend API Testing...")
        print(f"Testing against: {self.base_url}")
        
        start_time = datetime.now()
        
        # Setup
        if not self.setup_admin_user():
            print("❌ Could not setup admin user. Some tests will be skipped.")
        
        # Run all tests
        self.test_forgot_password()
        self.test_reset_password()
        self.test_user_editing()
        self.test_reports_generation()
        self.test_report_history()
        self.test_frontend_content_cms()
        self.test_social_sharing()
        self.test_advanced_sponsor_metrics()
        self.test_top_buyer()
        
        # Results
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n📊 Test Results Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        print(f"Duration: {duration:.1f}s")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SuerteAppTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results_file = f"/app/test_reports/backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())