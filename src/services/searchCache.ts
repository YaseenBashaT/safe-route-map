import type { NominatimResult } from './geocodingService';

export interface CachedPlace {
  name: string;
  displayName: string;
  lat: string;
  lon: string;
  type: string;
  state: string;
  country: string;
  aliases?: string[]; // Alternative names/spellings
}

// Pre-loaded database of major Indian places for instant search
const CACHED_PLACES: CachedPlace[] = [
  // Major Metros
  { name: 'Delhi', displayName: 'Delhi, National Capital Territory, India', lat: '28.6139', lon: '77.2090', type: 'city', state: 'Delhi', country: 'India', aliases: ['new delhi', 'dilli', 'ncr'] },
  { name: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', lat: '19.0760', lon: '72.8777', type: 'city', state: 'Maharashtra', country: 'India', aliases: ['bombay'] },
  { name: 'Bangalore', displayName: 'Bangalore, Karnataka, India', lat: '12.9716', lon: '77.5946', type: 'city', state: 'Karnataka', country: 'India', aliases: ['bengaluru', 'blr'] },
  { name: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', lat: '13.0827', lon: '80.2707', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['madras'] },
  { name: 'Kolkata', displayName: 'Kolkata, West Bengal, India', lat: '22.5726', lon: '88.3639', type: 'city', state: 'West Bengal', country: 'India', aliases: ['calcutta'] },
  { name: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', lat: '17.3850', lon: '78.4867', type: 'city', state: 'Telangana', country: 'India', aliases: ['hyd'] },
  
  // Major Cities
  { name: 'Ahmedabad', displayName: 'Ahmedabad, Gujarat, India', lat: '23.0225', lon: '72.5714', type: 'city', state: 'Gujarat', country: 'India', aliases: ['amdavad'] },
  { name: 'Pune', displayName: 'Pune, Maharashtra, India', lat: '18.5204', lon: '73.8567', type: 'city', state: 'Maharashtra', country: 'India', aliases: ['poona'] },
  { name: 'Jaipur', displayName: 'Jaipur, Rajasthan, India', lat: '26.9124', lon: '75.7873', type: 'city', state: 'Rajasthan', country: 'India', aliases: ['pink city'] },
  { name: 'Lucknow', displayName: 'Lucknow, Uttar Pradesh, India', lat: '26.8467', lon: '80.9462', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Kanpur', displayName: 'Kanpur, Uttar Pradesh, India', lat: '26.4499', lon: '80.3319', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Nagpur', displayName: 'Nagpur, Maharashtra, India', lat: '21.1458', lon: '79.0882', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Indore', displayName: 'Indore, Madhya Pradesh, India', lat: '22.7196', lon: '75.8577', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Thane', displayName: 'Thane, Maharashtra, India', lat: '19.2183', lon: '72.9781', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Bhopal', displayName: 'Bhopal, Madhya Pradesh, India', lat: '23.2599', lon: '77.4126', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Visakhapatnam', displayName: 'Visakhapatnam, Andhra Pradesh, India', lat: '17.6868', lon: '83.2185', type: 'city', state: 'Andhra Pradesh', country: 'India', aliases: ['vizag'] },
  { name: 'Patna', displayName: 'Patna, Bihar, India', lat: '25.5941', lon: '85.1376', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Vadodara', displayName: 'Vadodara, Gujarat, India', lat: '22.3072', lon: '73.1812', type: 'city', state: 'Gujarat', country: 'India', aliases: ['baroda'] },
  { name: 'Ghaziabad', displayName: 'Ghaziabad, Uttar Pradesh, India', lat: '28.6692', lon: '77.4538', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ludhiana', displayName: 'Ludhiana, Punjab, India', lat: '30.9010', lon: '75.8573', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Agra', displayName: 'Agra, Uttar Pradesh, India', lat: '27.1767', lon: '78.0081', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Nashik', displayName: 'Nashik, Maharashtra, India', lat: '19.9975', lon: '73.7898', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Faridabad', displayName: 'Faridabad, Haryana, India', lat: '28.4089', lon: '77.3178', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Meerut', displayName: 'Meerut, Uttar Pradesh, India', lat: '28.9845', lon: '77.7064', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Rajkot', displayName: 'Rajkot, Gujarat, India', lat: '22.3039', lon: '70.8022', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Varanasi', displayName: 'Varanasi, Uttar Pradesh, India', lat: '25.3176', lon: '83.0064', type: 'city', state: 'Uttar Pradesh', country: 'India', aliases: ['banaras', 'benares', 'kashi'] },
  { name: 'Srinagar', displayName: 'Srinagar, Jammu and Kashmir, India', lat: '34.0837', lon: '74.7973', type: 'city', state: 'Jammu and Kashmir', country: 'India' },
  { name: 'Amritsar', displayName: 'Amritsar, Punjab, India', lat: '31.6340', lon: '74.8723', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Allahabad', displayName: 'Prayagraj (Allahabad), Uttar Pradesh, India', lat: '25.4358', lon: '81.8463', type: 'city', state: 'Uttar Pradesh', country: 'India', aliases: ['prayagraj'] },
  { name: 'Ranchi', displayName: 'Ranchi, Jharkhand, India', lat: '23.3441', lon: '85.3096', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Coimbatore', displayName: 'Coimbatore, Tamil Nadu, India', lat: '11.0168', lon: '76.9558', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Jabalpur', displayName: 'Jabalpur, Madhya Pradesh, India', lat: '23.1815', lon: '79.9864', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Gwalior', displayName: 'Gwalior, Madhya Pradesh, India', lat: '26.2183', lon: '78.1828', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Vijayawada', displayName: 'Vijayawada, Andhra Pradesh, India', lat: '16.5062', lon: '80.6480', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Jodhpur', displayName: 'Jodhpur, Rajasthan, India', lat: '26.2389', lon: '73.0243', type: 'city', state: 'Rajasthan', country: 'India', aliases: ['blue city'] },
  { name: 'Madurai', displayName: 'Madurai, Tamil Nadu, India', lat: '9.9252', lon: '78.1198', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Raipur', displayName: 'Raipur, Chhattisgarh, India', lat: '21.2514', lon: '81.6296', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Kota', displayName: 'Kota, Rajasthan, India', lat: '25.2138', lon: '75.8648', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Chandigarh', displayName: 'Chandigarh, India', lat: '30.7333', lon: '76.7794', type: 'city', state: 'Chandigarh', country: 'India' },
  { name: 'Guwahati', displayName: 'Guwahati, Assam, India', lat: '26.1445', lon: '91.7362', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Solapur', displayName: 'Solapur, Maharashtra, India', lat: '17.6599', lon: '75.9064', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Hubli', displayName: 'Hubli-Dharwad, Karnataka, India', lat: '15.3647', lon: '75.1240', type: 'city', state: 'Karnataka', country: 'India', aliases: ['dharwad'] },
  { name: 'Mysore', displayName: 'Mysore, Karnataka, India', lat: '12.2958', lon: '76.6394', type: 'city', state: 'Karnataka', country: 'India', aliases: ['mysuru'] },
  { name: 'Tiruchirappalli', displayName: 'Tiruchirappalli, Tamil Nadu, India', lat: '10.7905', lon: '78.7047', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['trichy'] },
  { name: 'Bareilly', displayName: 'Bareilly, Uttar Pradesh, India', lat: '28.3670', lon: '79.4304', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Aligarh', displayName: 'Aligarh, Uttar Pradesh, India', lat: '27.8974', lon: '78.0880', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Moradabad', displayName: 'Moradabad, Uttar Pradesh, India', lat: '28.8386', lon: '78.7733', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Gorakhpur', displayName: 'Gorakhpur, Uttar Pradesh, India', lat: '26.7606', lon: '83.3732', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Bikaner', displayName: 'Bikaner, Rajasthan, India', lat: '28.0229', lon: '73.3119', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Amravati', displayName: 'Amravati, Maharashtra, India', lat: '20.9320', lon: '77.7523', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Noida', displayName: 'Noida, Uttar Pradesh, India', lat: '28.5355', lon: '77.3910', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Jamshedpur', displayName: 'Jamshedpur, Jharkhand, India', lat: '22.8046', lon: '86.2029', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Bhilai', displayName: 'Bhilai, Chhattisgarh, India', lat: '21.2094', lon: '81.4285', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Cuttack', displayName: 'Cuttack, Odisha, India', lat: '20.4625', lon: '85.8830', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Bhubaneswar', displayName: 'Bhubaneswar, Odisha, India', lat: '20.2961', lon: '85.8245', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Dehradun', displayName: 'Dehradun, Uttarakhand, India', lat: '30.3165', lon: '78.0322', type: 'city', state: 'Uttarakhand', country: 'India' },
  { name: 'Durgapur', displayName: 'Durgapur, West Bengal, India', lat: '23.5204', lon: '87.3119', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Asansol', displayName: 'Asansol, West Bengal, India', lat: '23.6739', lon: '86.9524', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Nanded', displayName: 'Nanded, Maharashtra, India', lat: '19.1383', lon: '77.3210', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Kolhapur', displayName: 'Kolhapur, Maharashtra, India', lat: '16.7050', lon: '74.2433', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Ajmer', displayName: 'Ajmer, Rajasthan, India', lat: '26.4499', lon: '74.6399', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Aurangabad', displayName: 'Aurangabad, Maharashtra, India', lat: '19.8762', lon: '75.3433', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Jammu', displayName: 'Jammu, Jammu and Kashmir, India', lat: '32.7266', lon: '74.8570', type: 'city', state: 'Jammu and Kashmir', country: 'India' },
  { name: 'Bokaro', displayName: 'Bokaro Steel City, Jharkhand, India', lat: '23.6693', lon: '86.1511', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Belgaum', displayName: 'Belgaum, Karnataka, India', lat: '15.8497', lon: '74.4977', type: 'city', state: 'Karnataka', country: 'India', aliases: ['belagavi'] },
  { name: 'Tiruppur', displayName: 'Tiruppur, Tamil Nadu, India', lat: '11.1085', lon: '77.3411', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Mangalore', displayName: 'Mangalore, Karnataka, India', lat: '12.9141', lon: '74.8560', type: 'city', state: 'Karnataka', country: 'India', aliases: ['mangaluru'] },
  { name: 'Erode', displayName: 'Erode, Tamil Nadu, India', lat: '11.3410', lon: '77.7172', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Salem', displayName: 'Salem, Tamil Nadu, India', lat: '11.6643', lon: '78.1460', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Udaipur', displayName: 'Udaipur, Rajasthan, India', lat: '24.5854', lon: '73.7125', type: 'city', state: 'Rajasthan', country: 'India', aliases: ['city of lakes'] },
  { name: 'Mathura', displayName: 'Mathura, Uttar Pradesh, India', lat: '27.4924', lon: '77.6737', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Guntur', displayName: 'Guntur, Andhra Pradesh, India', lat: '16.3067', lon: '80.4365', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Firozabad', displayName: 'Firozabad, Uttar Pradesh, India', lat: '27.1517', lon: '78.3956', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Davangere', displayName: 'Davangere, Karnataka, India', lat: '14.4644', lon: '75.9218', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Shimla', displayName: 'Shimla, Himachal Pradesh, India', lat: '31.1048', lon: '77.1734', type: 'city', state: 'Himachal Pradesh', country: 'India' },
  { name: 'Rishikesh', displayName: 'Rishikesh, Uttarakhand, India', lat: '30.0869', lon: '78.2676', type: 'city', state: 'Uttarakhand', country: 'India' },
  { name: 'Haridwar', displayName: 'Haridwar, Uttarakhand, India', lat: '29.9457', lon: '78.1642', type: 'city', state: 'Uttarakhand', country: 'India' },
  { name: 'Nainital', displayName: 'Nainital, Uttarakhand, India', lat: '29.3919', lon: '79.4542', type: 'city', state: 'Uttarakhand', country: 'India' },
  { name: 'Manali', displayName: 'Manali, Himachal Pradesh, India', lat: '32.2432', lon: '77.1892', type: 'city', state: 'Himachal Pradesh', country: 'India' },
  { name: 'Darjeeling', displayName: 'Darjeeling, West Bengal, India', lat: '27.0410', lon: '88.2663', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Gangtok', displayName: 'Gangtok, Sikkim, India', lat: '27.3389', lon: '88.6065', type: 'city', state: 'Sikkim', country: 'India' },
  { name: 'Shillong', displayName: 'Shillong, Meghalaya, India', lat: '25.5788', lon: '91.8933', type: 'city', state: 'Meghalaya', country: 'India' },
  { name: 'Imphal', displayName: 'Imphal, Manipur, India', lat: '24.8170', lon: '93.9368', type: 'city', state: 'Manipur', country: 'India' },
  { name: 'Itanagar', displayName: 'Itanagar, Arunachal Pradesh, India', lat: '27.0844', lon: '93.6053', type: 'city', state: 'Arunachal Pradesh', country: 'India' },
  { name: 'Kohima', displayName: 'Kohima, Nagaland, India', lat: '25.6751', lon: '94.1086', type: 'city', state: 'Nagaland', country: 'India' },
  { name: 'Aizawl', displayName: 'Aizawl, Mizoram, India', lat: '23.7307', lon: '92.7173', type: 'city', state: 'Mizoram', country: 'India' },
  { name: 'Agartala', displayName: 'Agartala, Tripura, India', lat: '23.8315', lon: '91.2868', type: 'city', state: 'Tripura', country: 'India' },
  { name: 'Panaji', displayName: 'Panaji, Goa, India', lat: '15.4909', lon: '73.8278', type: 'city', state: 'Goa', country: 'India', aliases: ['panjim'] },
  { name: 'Margao', displayName: 'Margao, Goa, India', lat: '15.2832', lon: '73.9862', type: 'city', state: 'Goa', country: 'India' },
  { name: 'Thiruvananthapuram', displayName: 'Thiruvananthapuram, Kerala, India', lat: '8.5241', lon: '76.9366', type: 'city', state: 'Kerala', country: 'India', aliases: ['trivandrum'] },
  { name: 'Kochi', displayName: 'Kochi, Kerala, India', lat: '9.9312', lon: '76.2673', type: 'city', state: 'Kerala', country: 'India', aliases: ['cochin'] },
  { name: 'Kozhikode', displayName: 'Kozhikode, Kerala, India', lat: '11.2588', lon: '75.7804', type: 'city', state: 'Kerala', country: 'India', aliases: ['calicut'] },
  { name: 'Thrissur', displayName: 'Thrissur, Kerala, India', lat: '10.5276', lon: '76.2144', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Kollam', displayName: 'Kollam, Kerala, India', lat: '8.8932', lon: '76.6141', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Pondicherry', displayName: 'Pondicherry, Puducherry, India', lat: '11.9416', lon: '79.8083', type: 'city', state: 'Puducherry', country: 'India', aliases: ['puducherry'] },
  { name: 'Tirupati', displayName: 'Tirupati, Andhra Pradesh, India', lat: '13.6288', lon: '79.4192', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Nellore', displayName: 'Nellore, Andhra Pradesh, India', lat: '14.4426', lon: '79.9865', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Warangal', displayName: 'Warangal, Telangana, India', lat: '17.9689', lon: '79.5941', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Secunderabad', displayName: 'Secunderabad, Telangana, India', lat: '17.4399', lon: '78.4983', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Karimnagar', displayName: 'Karimnagar, Telangana, India', lat: '18.4386', lon: '79.1288', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Rajahmundry', displayName: 'Rajahmundry, Andhra Pradesh, India', lat: '17.0005', lon: '81.8040', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kakinada', displayName: 'Kakinada, Andhra Pradesh, India', lat: '16.9891', lon: '82.2475', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kurnool', displayName: 'Kurnool, Andhra Pradesh, India', lat: '15.8281', lon: '78.0373', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Bellary', displayName: 'Bellary, Karnataka, India', lat: '15.1394', lon: '76.9214', type: 'city', state: 'Karnataka', country: 'India', aliases: ['ballari'] },
  { name: 'Shimoga', displayName: 'Shimoga, Karnataka, India', lat: '13.9299', lon: '75.5681', type: 'city', state: 'Karnataka', country: 'India', aliases: ['shivamogga'] },
  { name: 'Tumkur', displayName: 'Tumkur, Karnataka, India', lat: '13.3379', lon: '77.1173', type: 'city', state: 'Karnataka', country: 'India', aliases: ['tumakuru'] },
  { name: 'Gulbarga', displayName: 'Gulbarga, Karnataka, India', lat: '17.3297', lon: '76.8343', type: 'city', state: 'Karnataka', country: 'India', aliases: ['kalaburagi'] },
  { name: 'Thanjavur', displayName: 'Thanjavur, Tamil Nadu, India', lat: '10.7870', lon: '79.1378', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['tanjore'] },
  { name: 'Tirunelveli', displayName: 'Tirunelveli, Tamil Nadu, India', lat: '8.7139', lon: '77.7567', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Vellore', displayName: 'Vellore, Tamil Nadu, India', lat: '12.9165', lon: '79.1325', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Dindigul', displayName: 'Dindigul, Tamil Nadu, India', lat: '10.3624', lon: '77.9695', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Thoothukudi', displayName: 'Thoothukudi, Tamil Nadu, India', lat: '8.7642', lon: '78.1348', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['tuticorin'] },
  { name: 'Bilaspur', displayName: 'Bilaspur, Chhattisgarh, India', lat: '22.0797', lon: '82.1391', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Rourkela', displayName: 'Rourkela, Odisha, India', lat: '22.2604', lon: '84.8536', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Sambalpur', displayName: 'Sambalpur, Odisha, India', lat: '21.4669', lon: '83.9812', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Puri', displayName: 'Puri, Odisha, India', lat: '19.8135', lon: '85.8312', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Dhanbad', displayName: 'Dhanbad, Jharkhand, India', lat: '23.7957', lon: '86.4304', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Muzaffarpur', displayName: 'Muzaffarpur, Bihar, India', lat: '26.1209', lon: '85.3647', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Gaya', displayName: 'Gaya, Bihar, India', lat: '24.7955', lon: '85.0002', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Bhagalpur', displayName: 'Bhagalpur, Bihar, India', lat: '25.2425', lon: '86.9842', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Darbhanga', displayName: 'Darbhanga, Bihar, India', lat: '26.1542', lon: '85.8918', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Purnia', displayName: 'Purnia, Bihar, India', lat: '25.7771', lon: '87.4753', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Howrah', displayName: 'Howrah, West Bengal, India', lat: '22.5958', lon: '88.2636', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Siliguri', displayName: 'Siliguri, West Bengal, India', lat: '26.7271', lon: '88.3953', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Malda', displayName: 'Malda, West Bengal, India', lat: '25.0108', lon: '88.1453', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Kharagpur', displayName: 'Kharagpur, West Bengal, India', lat: '22.3460', lon: '87.2320', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Jalandhar', displayName: 'Jalandhar, Punjab, India', lat: '31.3260', lon: '75.5762', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Patiala', displayName: 'Patiala, Punjab, India', lat: '30.3398', lon: '76.3869', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Bathinda', displayName: 'Bathinda, Punjab, India', lat: '30.2110', lon: '74.9455', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Pathankot', displayName: 'Pathankot, Punjab, India', lat: '32.2643', lon: '75.6421', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Ambala', displayName: 'Ambala, Haryana, India', lat: '30.3752', lon: '76.7821', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Panipat', displayName: 'Panipat, Haryana, India', lat: '29.3909', lon: '76.9635', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Karnal', displayName: 'Karnal, Haryana, India', lat: '29.6857', lon: '76.9905', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Rohtak', displayName: 'Rohtak, Haryana, India', lat: '28.8955', lon: '76.6066', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Hisar', displayName: 'Hisar, Haryana, India', lat: '29.1492', lon: '75.7217', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Sonipat', displayName: 'Sonipat, Haryana, India', lat: '28.9288', lon: '77.0913', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Gurugram', displayName: 'Gurugram, Haryana, India', lat: '28.4595', lon: '77.0266', type: 'city', state: 'Haryana', country: 'India', aliases: ['gurgaon'] },
  { name: 'Surat', displayName: 'Surat, Gujarat, India', lat: '21.1702', lon: '72.8311', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Bhavnagar', displayName: 'Bhavnagar, Gujarat, India', lat: '21.7645', lon: '72.1519', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Jamnagar', displayName: 'Jamnagar, Gujarat, India', lat: '22.4707', lon: '70.0577', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Junagadh', displayName: 'Junagadh, Gujarat, India', lat: '21.5222', lon: '70.4579', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Gandhinagar', displayName: 'Gandhinagar, Gujarat, India', lat: '23.2156', lon: '72.6369', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Anand', displayName: 'Anand, Gujarat, India', lat: '22.5645', lon: '72.9289', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Bharuch', displayName: 'Bharuch, Gujarat, India', lat: '21.7051', lon: '72.9959', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Vapi', displayName: 'Vapi, Gujarat, India', lat: '20.3893', lon: '72.9106', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Navsari', displayName: 'Navsari, Gujarat, India', lat: '20.9467', lon: '72.9520', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Ujjain', displayName: 'Ujjain, Madhya Pradesh, India', lat: '23.1765', lon: '75.7885', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Sagar', displayName: 'Sagar, Madhya Pradesh, India', lat: '23.8388', lon: '78.7378', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Satna', displayName: 'Satna, Madhya Pradesh, India', lat: '24.5879', lon: '80.8322', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Rewa', displayName: 'Rewa, Madhya Pradesh, India', lat: '24.5312', lon: '81.2991', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Akola', displayName: 'Akola, Maharashtra, India', lat: '20.7059', lon: '77.0049', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Latur', displayName: 'Latur, Maharashtra, India', lat: '18.4088', lon: '76.5604', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Chandrapur', displayName: 'Chandrapur, Maharashtra, India', lat: '19.9615', lon: '79.2961', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Parbhani', displayName: 'Parbhani, Maharashtra, India', lat: '19.2704', lon: '76.7626', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Jalgaon', displayName: 'Jalgaon, Maharashtra, India', lat: '21.0077', lon: '75.5626', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Sangli', displayName: 'Sangli, Maharashtra, India', lat: '16.8524', lon: '74.5815', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Satara', displayName: 'Satara, Maharashtra, India', lat: '17.6805', lon: '74.0183', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Bhiwandi', displayName: 'Bhiwandi, Maharashtra, India', lat: '19.2813', lon: '73.0483', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Malegaon', displayName: 'Malegaon, Maharashtra, India', lat: '20.5579', lon: '74.5089', type: 'city', state: 'Maharashtra', country: 'India' },

  // Famous Landmarks & Tourist Places
  { name: 'Taj Mahal', displayName: 'Taj Mahal, Agra, Uttar Pradesh, India', lat: '27.1751', lon: '78.0421', type: 'attraction', state: 'Uttar Pradesh', country: 'India' },
  { name: 'India Gate', displayName: 'India Gate, New Delhi, India', lat: '28.6129', lon: '77.2295', type: 'attraction', state: 'Delhi', country: 'India' },
  { name: 'Gateway of India', displayName: 'Gateway of India, Mumbai, Maharashtra, India', lat: '18.9220', lon: '72.8347', type: 'attraction', state: 'Maharashtra', country: 'India' },
  { name: 'Qutub Minar', displayName: 'Qutub Minar, New Delhi, India', lat: '28.5245', lon: '77.1855', type: 'attraction', state: 'Delhi', country: 'India' },
  { name: 'Red Fort', displayName: 'Red Fort, New Delhi, India', lat: '28.6562', lon: '77.2410', type: 'attraction', state: 'Delhi', country: 'India' },
  { name: 'Hawa Mahal', displayName: 'Hawa Mahal, Jaipur, Rajasthan, India', lat: '26.9239', lon: '75.8267', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'Charminar', displayName: 'Charminar, Hyderabad, Telangana, India', lat: '17.3616', lon: '78.4747', type: 'attraction', state: 'Telangana', country: 'India' },
  { name: 'Golden Temple', displayName: 'Golden Temple, Amritsar, Punjab, India', lat: '31.6200', lon: '74.8765', type: 'attraction', state: 'Punjab', country: 'India', aliases: ['harmandir sahib'] },
  { name: 'Meenakshi Temple', displayName: 'Meenakshi Temple, Madurai, Tamil Nadu, India', lat: '9.9195', lon: '78.1193', type: 'attraction', state: 'Tamil Nadu', country: 'India' },
  { name: 'Mysore Palace', displayName: 'Mysore Palace, Mysore, Karnataka, India', lat: '12.3052', lon: '76.6551', type: 'attraction', state: 'Karnataka', country: 'India' },
  { name: 'Victoria Memorial', displayName: 'Victoria Memorial, Kolkata, West Bengal, India', lat: '22.5448', lon: '88.3426', type: 'attraction', state: 'West Bengal', country: 'India' },
  { name: 'Howrah Bridge', displayName: 'Howrah Bridge, Kolkata, West Bengal, India', lat: '22.5852', lon: '88.3468', type: 'attraction', state: 'West Bengal', country: 'India' },
  { name: 'Lotus Temple', displayName: 'Lotus Temple, New Delhi, India', lat: '28.5535', lon: '77.2588', type: 'attraction', state: 'Delhi', country: 'India' },
  { name: 'Akshardham', displayName: 'Akshardham Temple, New Delhi, India', lat: '28.6127', lon: '77.2773', type: 'attraction', state: 'Delhi', country: 'India' },
  { name: 'Amber Fort', displayName: 'Amber Fort, Jaipur, Rajasthan, India', lat: '26.9855', lon: '75.8513', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'City Palace Jaipur', displayName: 'City Palace, Jaipur, Rajasthan, India', lat: '26.9258', lon: '75.8237', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'City Palace Udaipur', displayName: 'City Palace, Udaipur, Rajasthan, India', lat: '24.5764', lon: '73.6913', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'Jaisalmer Fort', displayName: 'Jaisalmer Fort, Jaisalmer, Rajasthan, India', lat: '26.9124', lon: '70.9120', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'Mehrangarh Fort', displayName: 'Mehrangarh Fort, Jodhpur, Rajasthan, India', lat: '26.2979', lon: '73.0183', type: 'attraction', state: 'Rajasthan', country: 'India' },
  { name: 'Konark Sun Temple', displayName: 'Konark Sun Temple, Odisha, India', lat: '19.8876', lon: '86.0946', type: 'attraction', state: 'Odisha', country: 'India' },
  { name: 'Ajanta Caves', displayName: 'Ajanta Caves, Maharashtra, India', lat: '20.5519', lon: '75.7033', type: 'attraction', state: 'Maharashtra', country: 'India' },
  { name: 'Ellora Caves', displayName: 'Ellora Caves, Maharashtra, India', lat: '20.0269', lon: '75.1779', type: 'attraction', state: 'Maharashtra', country: 'India' },
  { name: 'Kanyakumari', displayName: 'Kanyakumari, Tamil Nadu, India', lat: '8.0883', lon: '77.5385', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['cape comorin'] },
  { name: 'Kovalam Beach', displayName: 'Kovalam Beach, Kerala, India', lat: '8.4004', lon: '76.9787', type: 'attraction', state: 'Kerala', country: 'India' },
  { name: 'Munnar', displayName: 'Munnar, Kerala, India', lat: '10.0889', lon: '77.0595', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Alleppey', displayName: 'Alleppey, Kerala, India', lat: '9.4981', lon: '76.3388', type: 'city', state: 'Kerala', country: 'India', aliases: ['alappuzha'] },
  { name: 'Ooty', displayName: 'Ooty, Tamil Nadu, India', lat: '11.4102', lon: '76.6950', type: 'city', state: 'Tamil Nadu', country: 'India', aliases: ['ootacamund', 'udhagamandalam'] },
  { name: 'Kodaikanal', displayName: 'Kodaikanal, Tamil Nadu, India', lat: '10.2381', lon: '77.4892', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Mahabalipuram', displayName: 'Mahabalipuram, Tamil Nadu, India', lat: '12.6169', lon: '80.1927', type: 'attraction', state: 'Tamil Nadu', country: 'India', aliases: ['mamallapuram'] },
  { name: 'Goa Beaches', displayName: 'Calangute Beach, Goa, India', lat: '15.5449', lon: '73.7550', type: 'attraction', state: 'Goa', country: 'India', aliases: ['calangute', 'baga beach', 'anjuna'] },
  { name: 'Ladakh', displayName: 'Leh, Ladakh, India', lat: '34.1526', lon: '77.5771', type: 'city', state: 'Ladakh', country: 'India', aliases: ['leh'] },
  { name: 'Jaipur Railway Station', displayName: 'Jaipur Railway Station, Rajasthan, India', lat: '26.9196', lon: '75.7878', type: 'station', state: 'Rajasthan', country: 'India' },
  { name: 'Howrah Railway Station', displayName: 'Howrah Railway Station, West Bengal, India', lat: '22.5850', lon: '88.3422', type: 'station', state: 'West Bengal', country: 'India' },
  { name: 'Chennai Central', displayName: 'Chennai Central Railway Station, Tamil Nadu, India', lat: '13.0827', lon: '80.2758', type: 'station', state: 'Tamil Nadu', country: 'India' },
  { name: 'Mumbai CST', displayName: 'Chhatrapati Shivaji Terminus, Mumbai, Maharashtra, India', lat: '18.9398', lon: '72.8355', type: 'station', state: 'Maharashtra', country: 'India', aliases: ['cst', 'vt'] },
  { name: 'New Delhi Railway Station', displayName: 'New Delhi Railway Station, Delhi, India', lat: '28.6424', lon: '77.2196', type: 'station', state: 'Delhi', country: 'India' },
  { name: 'Old Delhi Railway Station', displayName: 'Old Delhi Railway Station, Delhi, India', lat: '28.6617', lon: '77.2267', type: 'station', state: 'Delhi', country: 'India' },
  { name: 'Bengaluru City Railway Station', displayName: 'Bengaluru City Junction, Karnataka, India', lat: '12.9780', lon: '77.5704', type: 'station', state: 'Karnataka', country: 'India' },

  // Major Airports
  { name: 'Delhi Airport', displayName: 'Indira Gandhi International Airport, Delhi, India', lat: '28.5562', lon: '77.1000', type: 'airport', state: 'Delhi', country: 'India', aliases: ['igi', 'del'] },
  { name: 'Mumbai Airport', displayName: 'Chhatrapati Shivaji Maharaj International Airport, Mumbai, India', lat: '19.0896', lon: '72.8656', type: 'airport', state: 'Maharashtra', country: 'India', aliases: ['bom'] },
  { name: 'Bangalore Airport', displayName: 'Kempegowda International Airport, Bangalore, India', lat: '13.1979', lon: '77.7063', type: 'airport', state: 'Karnataka', country: 'India', aliases: ['blr', 'kia'] },
  { name: 'Chennai Airport', displayName: 'Chennai International Airport, Tamil Nadu, India', lat: '12.9941', lon: '80.1709', type: 'airport', state: 'Tamil Nadu', country: 'India', aliases: ['maa'] },
  { name: 'Kolkata Airport', displayName: 'Netaji Subhas Chandra Bose International Airport, Kolkata, India', lat: '22.6520', lon: '88.4463', type: 'airport', state: 'West Bengal', country: 'India', aliases: ['ccu'] },
  { name: 'Hyderabad Airport', displayName: 'Rajiv Gandhi International Airport, Hyderabad, India', lat: '17.2403', lon: '78.4294', type: 'airport', state: 'Telangana', country: 'India', aliases: ['hyd'] },
  { name: 'Cochin Airport', displayName: 'Cochin International Airport, Kerala, India', lat: '10.1520', lon: '76.3919', type: 'airport', state: 'Kerala', country: 'India', aliases: ['cok'] },
  { name: 'Goa Airport', displayName: 'Goa International Airport, Goa, India', lat: '15.3808', lon: '73.8314', type: 'airport', state: 'Goa', country: 'India', aliases: ['goi'] },
  { name: 'Ahmedabad Airport', displayName: 'Sardar Vallabhbhai Patel International Airport, Ahmedabad, India', lat: '23.0774', lon: '72.6347', type: 'airport', state: 'Gujarat', country: 'India', aliases: ['amd'] },
  { name: 'Pune Airport', displayName: 'Pune International Airport, Pune, India', lat: '18.5822', lon: '73.9197', type: 'airport', state: 'Maharashtra', country: 'India', aliases: ['pnq'] },
  { name: 'Jaipur Airport', displayName: 'Jaipur International Airport, Rajasthan, India', lat: '26.8242', lon: '75.8122', type: 'airport', state: 'Rajasthan', country: 'India', aliases: ['jai'] },
  { name: 'Lucknow Airport', displayName: 'Chaudhary Charan Singh International Airport, Lucknow, India', lat: '26.7606', lon: '80.8893', type: 'airport', state: 'Uttar Pradesh', country: 'India', aliases: ['lko'] },
];

// Local storage cache key
const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  query: string;
  results: NominatimResult[];
  timestamp: number;
}

interface CacheStore {
  entries: CacheEntry[];
  version: number;
}

// Get or create cache store
function getCache(): CacheStore {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const store: CacheStore = JSON.parse(cached);
      // Clean up expired entries
      const now = Date.now();
      store.entries = store.entries.filter(e => now - e.timestamp < CACHE_EXPIRY_MS);
      return store;
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return { entries: [], version: 1 };
}

// Save cache to localStorage
function saveCache(store: CacheStore): void {
  try {
    // Keep only last 500 entries
    if (store.entries.length > 500) {
      store.entries = store.entries.slice(-500);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Cache save error:', e);
  }
}

// Convert cached place to NominatimResult
function cachedPlaceToResult(place: CachedPlace, index: number): NominatimResult {
  return {
    place_id: 1000000 + index,
    display_name: place.displayName,
    lat: place.lat,
    lon: place.lon,
    type: place.type,
    importance: 0.9 - (index * 0.01), // Higher priority for exact matches
    address: {
      city: place.name,
      state: place.state,
      country: place.country,
    },
    class: place.type === 'city' ? 'place' : place.type === 'attraction' ? 'tourism' : 'transport',
  };
}

// Fast local search - O(n) but very quick with small dataset
export function searchLocalCache(query: string): NominatimResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.length < 2) return [];

  const results: { place: CachedPlace; score: number; index: number }[] = [];

  CACHED_PLACES.forEach((place, index) => {
    const name = place.name.toLowerCase();
    const displayName = place.displayName.toLowerCase();
    const aliases = place.aliases || [];

    let score = 0;

    // Exact match - highest priority
    if (name === normalizedQuery) {
      score = 100;
    }
    // Starts with query
    else if (name.startsWith(normalizedQuery)) {
      score = 90 - (name.length - normalizedQuery.length) * 0.5;
    }
    // Alias exact match
    else if (aliases.some(a => a === normalizedQuery)) {
      score = 85;
    }
    // Alias starts with
    else if (aliases.some(a => a.startsWith(normalizedQuery))) {
      score = 80;
    }
    // Contains query
    else if (name.includes(normalizedQuery)) {
      score = 70 - (name.indexOf(normalizedQuery) * 0.5);
    }
    // Display name contains
    else if (displayName.includes(normalizedQuery)) {
      score = 60;
    }
    // State matches
    else if (place.state.toLowerCase().startsWith(normalizedQuery)) {
      score = 50;
    }
    // Fuzzy: words match
    else {
      const queryWords = normalizedQuery.split(/\s+/);
      const matches = queryWords.filter(w => 
        name.includes(w) || displayName.includes(w) || aliases.some(a => a.includes(w))
      );
      if (matches.length > 0) {
        score = 40 * (matches.length / queryWords.length);
      }
    }

    if (score > 0) {
      results.push({ place, score, index });
    }
  });

  // Sort by score (descending) and return top 10
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 10).map(r => cachedPlaceToResult(r.place, r.index));
}

// Search cached API results
export function searchCachedApiResults(query: string): NominatimResult[] | null {
  const cache = getCache();
  const normalizedQuery = query.toLowerCase().trim();
  
  // Look for exact or similar query in cache
  const entry = cache.entries.find(e => 
    e.query.toLowerCase() === normalizedQuery ||
    normalizedQuery.startsWith(e.query.toLowerCase()) ||
    e.query.toLowerCase().startsWith(normalizedQuery)
  );

  if (entry) {
    return entry.results;
  }
  return null;
}

// Cache API results for future use
export function cacheApiResults(query: string, results: NominatimResult[]): void {
  const cache = getCache();
  
  // Remove duplicate query if exists
  cache.entries = cache.entries.filter(e => e.query.toLowerCase() !== query.toLowerCase());
  
  // Add new entry
  cache.entries.push({
    query: query.toLowerCase(),
    results,
    timestamp: Date.now(),
  });

  saveCache(cache);
}

// Merge local results with API results, prioritizing local
export function mergeResults(
  localResults: NominatimResult[],
  apiResults: NominatimResult[]
): NominatimResult[] {
  const seen = new Set<string>();
  const merged: NominatimResult[] = [];

  // Add local results first (higher priority)
  for (const result of localResults) {
    const key = `${result.lat}-${result.lon}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    }
  }

  // Add API results that don't overlap
  for (const result of apiResults) {
    const key = `${result.lat}-${result.lon}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    }
  }

  return merged.slice(0, 10);
}
