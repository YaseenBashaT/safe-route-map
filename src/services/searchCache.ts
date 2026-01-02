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

  // Cities from Accident Data CSV - Additional smaller cities
  { name: 'Dwarka', displayName: 'Dwarka, Delhi, India', lat: '28.5973', lon: '77.0407', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Rohini', displayName: 'Rohini, Delhi, India', lat: '28.7495', lon: '77.0563', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Saket', displayName: 'Saket, Delhi, India', lat: '28.5244', lon: '77.2165', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Shahdara', displayName: 'Shahdara, Delhi, India', lat: '28.6736', lon: '77.2887', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Nehru Place', displayName: 'Nehru Place, Delhi, India', lat: '28.5491', lon: '77.2533', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Najafgarh', displayName: 'Najafgarh, Delhi, India', lat: '28.6092', lon: '76.9798', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Pitampura', displayName: 'Pitampura, Delhi, India', lat: '28.7052', lon: '77.1316', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Patiala House', displayName: 'Patiala House, Delhi, India', lat: '28.6219', lon: '77.2373', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Janakpuri', displayName: 'Janakpuri, Delhi, India', lat: '28.6219', lon: '77.0878', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Mayur Vihar', displayName: 'Mayur Vihar, Delhi, India', lat: '28.6066', lon: '77.2960', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Greater Kailash', displayName: 'Greater Kailash, Delhi, India', lat: '28.5505', lon: '77.2340', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Vasant Kunj', displayName: 'Vasant Kunj, Delhi, India', lat: '28.5186', lon: '77.1572', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Laxmi Nagar', displayName: 'Laxmi Nagar, Delhi, India', lat: '28.6304', lon: '77.2749', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Uttam Nagar', displayName: 'Uttam Nagar, Delhi, India', lat: '28.6174', lon: '77.0624', type: 'city', state: 'Delhi', country: 'India' },
  { name: 'Connaught Place', displayName: 'Connaught Place, Delhi, India', lat: '28.6315', lon: '77.2167', type: 'city', state: 'Delhi', country: 'India', aliases: ['cp'] },
  
  // Additional cities from accident data
  { name: 'Jaisalmer', displayName: 'Jaisalmer, Rajasthan, India', lat: '26.9157', lon: '70.9083', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Alwar', displayName: 'Alwar, Rajasthan, India', lat: '27.5530', lon: '76.6346', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Bharatpur', displayName: 'Bharatpur, Rajasthan, India', lat: '27.2152', lon: '77.5030', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Sikar', displayName: 'Sikar, Rajasthan, India', lat: '27.6094', lon: '75.1399', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Pali', displayName: 'Pali, Rajasthan, India', lat: '25.7711', lon: '73.3234', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Bhilwara', displayName: 'Bhilwara, Rajasthan, India', lat: '25.3407', lon: '74.6313', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Sri Ganganagar', displayName: 'Sri Ganganagar, Rajasthan, India', lat: '29.9094', lon: '73.8776', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Chittorgarh', displayName: 'Chittorgarh, Rajasthan, India', lat: '24.8887', lon: '74.6269', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Tonk', displayName: 'Tonk, Rajasthan, India', lat: '26.1665', lon: '75.7885', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Bundi', displayName: 'Bundi, Rajasthan, India', lat: '25.4305', lon: '75.6499', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Pushkar', displayName: 'Pushkar, Rajasthan, India', lat: '26.4897', lon: '74.5511', type: 'city', state: 'Rajasthan', country: 'India' },
  { name: 'Mount Abu', displayName: 'Mount Abu, Rajasthan, India', lat: '24.5926', lon: '72.7156', type: 'city', state: 'Rajasthan', country: 'India' },
  
  // Uttar Pradesh cities from accident data
  { name: 'Saharanpur', displayName: 'Saharanpur, Uttar Pradesh, India', lat: '29.9680', lon: '77.5510', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Muzaffarnagar', displayName: 'Muzaffarnagar, Uttar Pradesh, India', lat: '29.4727', lon: '77.7085', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Shahjahanpur', displayName: 'Shahjahanpur, Uttar Pradesh, India', lat: '27.8816', lon: '79.9050', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Rampur', displayName: 'Rampur, Uttar Pradesh, India', lat: '28.7990', lon: '79.0257', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Sambhal', displayName: 'Sambhal, Uttar Pradesh, India', lat: '28.5839', lon: '78.5577', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Hapur', displayName: 'Hapur, Uttar Pradesh, India', lat: '28.7440', lon: '77.7830', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Etawah', displayName: 'Etawah, Uttar Pradesh, India', lat: '26.7853', lon: '79.0156', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Jhansi', displayName: 'Jhansi, Uttar Pradesh, India', lat: '25.4484', lon: '78.5685', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Banda', displayName: 'Banda, Uttar Pradesh, India', lat: '25.4756', lon: '80.3380', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Fatehpur', displayName: 'Fatehpur, Uttar Pradesh, India', lat: '25.9304', lon: '80.8139', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Rae Bareli', displayName: 'Rae Bareli, Uttar Pradesh, India', lat: '26.2345', lon: '81.2307', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Unnao', displayName: 'Unnao, Uttar Pradesh, India', lat: '26.5393', lon: '80.4878', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Hardoi', displayName: 'Hardoi, Uttar Pradesh, India', lat: '27.3951', lon: '80.1313', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Sitapur', displayName: 'Sitapur, Uttar Pradesh, India', lat: '27.5619', lon: '80.6833', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Lakhimpur Kheri', displayName: 'Lakhimpur Kheri, Uttar Pradesh, India', lat: '27.9470', lon: '80.7882', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Bahraich', displayName: 'Bahraich, Uttar Pradesh, India', lat: '27.5744', lon: '81.5959', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Shravasti', displayName: 'Shravasti, Uttar Pradesh, India', lat: '27.5086', lon: '82.0559', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Balrampur', displayName: 'Balrampur, Uttar Pradesh, India', lat: '27.4286', lon: '82.1819', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Gonda', displayName: 'Gonda, Uttar Pradesh, India', lat: '27.1343', lon: '81.9619', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Basti', displayName: 'Basti, Uttar Pradesh, India', lat: '26.7877', lon: '82.7476', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Sant Kabir Nagar', displayName: 'Sant Kabir Nagar, Uttar Pradesh, India', lat: '26.7903', lon: '83.0365', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Maharajganj', displayName: 'Maharajganj, Uttar Pradesh, India', lat: '27.1340', lon: '83.5611', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Siddharthnagar', displayName: 'Siddharthnagar, Uttar Pradesh, India', lat: '27.2612', lon: '83.0025', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Deoria', displayName: 'Deoria, Uttar Pradesh, India', lat: '26.5024', lon: '83.7791', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Kushinagar', displayName: 'Kushinagar, Uttar Pradesh, India', lat: '26.7412', lon: '83.8869', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Azamgarh', displayName: 'Azamgarh, Uttar Pradesh, India', lat: '26.0734', lon: '83.1851', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Mau', displayName: 'Mau, Uttar Pradesh, India', lat: '25.9419', lon: '83.5613', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ballia', displayName: 'Ballia, Uttar Pradesh, India', lat: '25.7603', lon: '84.1486', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ghazipur', displayName: 'Ghazipur, Uttar Pradesh, India', lat: '25.5750', lon: '83.5774', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Jaunpur', displayName: 'Jaunpur, Uttar Pradesh, India', lat: '25.7463', lon: '82.6836', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Sultanpur', displayName: 'Sultanpur, Uttar Pradesh, India', lat: '26.2648', lon: '82.0728', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Pratapgarh', displayName: 'Pratapgarh, Uttar Pradesh, India', lat: '25.8960', lon: '81.9399', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Faizabad', displayName: 'Faizabad, Uttar Pradesh, India', lat: '26.7736', lon: '82.1442', type: 'city', state: 'Uttar Pradesh', country: 'India', aliases: ['ayodhya'] },
  { name: 'Ayodhya', displayName: 'Ayodhya, Uttar Pradesh, India', lat: '26.7922', lon: '82.1998', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Ambedkar Nagar', displayName: 'Ambedkar Nagar, Uttar Pradesh, India', lat: '26.4420', lon: '82.7388', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Mirzapur', displayName: 'Mirzapur, Uttar Pradesh, India', lat: '25.1337', lon: '82.5644', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Sonbhadra', displayName: 'Sonbhadra, Uttar Pradesh, India', lat: '24.6876', lon: '83.0622', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Chandauli', displayName: 'Chandauli, Uttar Pradesh, India', lat: '25.2713', lon: '83.2625', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  { name: 'Bhadohi', displayName: 'Bhadohi, Uttar Pradesh, India', lat: '25.4049', lon: '82.5749', type: 'city', state: 'Uttar Pradesh', country: 'India' },
  
  // Maharashtra cities from accident data
  { name: 'Thane', displayName: 'Thane, Maharashtra, India', lat: '19.2183', lon: '72.9781', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Kalyan', displayName: 'Kalyan, Maharashtra, India', lat: '19.2437', lon: '73.1355', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Dombivli', displayName: 'Dombivli, Maharashtra, India', lat: '19.2183', lon: '73.0867', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Vasai-Virar', displayName: 'Vasai-Virar, Maharashtra, India', lat: '19.3919', lon: '72.8397', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Navi Mumbai', displayName: 'Navi Mumbai, Maharashtra, India', lat: '19.0330', lon: '73.0297', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Ahmednagar', displayName: 'Ahmednagar, Maharashtra, India', lat: '19.0948', lon: '74.7480', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Dhule', displayName: 'Dhule, Maharashtra, India', lat: '20.9012', lon: '74.7774', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Ratnagiri', displayName: 'Ratnagiri, Maharashtra, India', lat: '16.9902', lon: '73.3120', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Sindhudurg', displayName: 'Sindhudurg, Maharashtra, India', lat: '16.0542', lon: '73.4690', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Osmanabad', displayName: 'Osmanabad, Maharashtra, India', lat: '18.1862', lon: '76.0445', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Beed', displayName: 'Beed, Maharashtra, India', lat: '18.9903', lon: '75.7601', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Jalna', displayName: 'Jalna, Maharashtra, India', lat: '19.8347', lon: '75.8806', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Hingoli', displayName: 'Hingoli, Maharashtra, India', lat: '19.7142', lon: '77.1493', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Washim', displayName: 'Washim, Maharashtra, India', lat: '20.1079', lon: '77.1329', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Yavatmal', displayName: 'Yavatmal, Maharashtra, India', lat: '20.3899', lon: '78.1307', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Wardha', displayName: 'Wardha, Maharashtra, India', lat: '20.7453', lon: '78.6022', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Bhandara', displayName: 'Bhandara, Maharashtra, India', lat: '21.1669', lon: '79.6500', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Gondia', displayName: 'Gondia, Maharashtra, India', lat: '21.4624', lon: '80.1969', type: 'city', state: 'Maharashtra', country: 'India' },
  { name: 'Gadchiroli', displayName: 'Gadchiroli, Maharashtra, India', lat: '20.1052', lon: '80.0034', type: 'city', state: 'Maharashtra', country: 'India' },
  
  // Tamil Nadu cities from accident data
  { name: 'Kanchipuram', displayName: 'Kanchipuram, Tamil Nadu, India', lat: '12.8342', lon: '79.7036', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Chengalpattu', displayName: 'Chengalpattu, Tamil Nadu, India', lat: '12.6868', lon: '79.9736', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Cuddalore', displayName: 'Cuddalore, Tamil Nadu, India', lat: '11.7480', lon: '79.7714', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Villupuram', displayName: 'Villupuram, Tamil Nadu, India', lat: '11.9395', lon: '79.4950', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Kallakurichi', displayName: 'Kallakurichi, Tamil Nadu, India', lat: '11.7333', lon: '78.9667', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tiruvannamalai', displayName: 'Tiruvannamalai, Tamil Nadu, India', lat: '12.2253', lon: '79.0747', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Dharmapuri', displayName: 'Dharmapuri, Tamil Nadu, India', lat: '12.1211', lon: '78.1582', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Krishnagiri', displayName: 'Krishnagiri, Tamil Nadu, India', lat: '12.5186', lon: '78.2137', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Namakkal', displayName: 'Namakkal, Tamil Nadu, India', lat: '11.2189', lon: '78.1674', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Karur', displayName: 'Karur, Tamil Nadu, India', lat: '10.9601', lon: '78.0766', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Perambalur', displayName: 'Perambalur, Tamil Nadu, India', lat: '11.2320', lon: '78.8800', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Ariyalur', displayName: 'Ariyalur, Tamil Nadu, India', lat: '11.1369', lon: '79.0786', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Nagapattinam', displayName: 'Nagapattinam, Tamil Nadu, India', lat: '10.7672', lon: '79.8449', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tiruvarur', displayName: 'Tiruvarur, Tamil Nadu, India', lat: '10.7716', lon: '79.6370', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Mayiladuthurai', displayName: 'Mayiladuthurai, Tamil Nadu, India', lat: '11.1014', lon: '79.6583', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Pudukkottai', displayName: 'Pudukkottai, Tamil Nadu, India', lat: '10.3833', lon: '78.8001', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Sivaganga', displayName: 'Sivaganga, Tamil Nadu, India', lat: '9.8433', lon: '78.4809', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Ramanathapuram', displayName: 'Ramanathapuram, Tamil Nadu, India', lat: '9.3639', lon: '78.8395', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Virudhunagar', displayName: 'Virudhunagar, Tamil Nadu, India', lat: '9.5680', lon: '77.9624', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Theni', displayName: 'Theni, Tamil Nadu, India', lat: '10.0104', lon: '77.4777', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Tenkasi', displayName: 'Tenkasi, Tamil Nadu, India', lat: '8.9604', lon: '77.3152', type: 'city', state: 'Tamil Nadu', country: 'India' },
  { name: 'Nagercoil', displayName: 'Nagercoil, Tamil Nadu, India', lat: '8.1833', lon: '77.4119', type: 'city', state: 'Tamil Nadu', country: 'India' },
  
  // Karnataka cities from accident data
  { name: 'Udupi', displayName: 'Udupi, Karnataka, India', lat: '13.3409', lon: '74.7421', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Uttara Kannada', displayName: 'Uttara Kannada, Karnataka, India', lat: '14.6807', lon: '74.4892', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Hassan', displayName: 'Hassan, Karnataka, India', lat: '13.0074', lon: '76.0962', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Chikmagalur', displayName: 'Chikmagalur, Karnataka, India', lat: '13.3161', lon: '75.7720', type: 'city', state: 'Karnataka', country: 'India', aliases: ['chikkamagaluru'] },
  { name: 'Kodagu', displayName: 'Kodagu, Karnataka, India', lat: '12.4244', lon: '75.7382', type: 'city', state: 'Karnataka', country: 'India', aliases: ['coorg'] },
  { name: 'Chamarajanagar', displayName: 'Chamarajanagar, Karnataka, India', lat: '11.9261', lon: '76.9437', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Mandya', displayName: 'Mandya, Karnataka, India', lat: '12.5218', lon: '76.8951', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Raichur', displayName: 'Raichur, Karnataka, India', lat: '16.2120', lon: '77.3439', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Koppal', displayName: 'Koppal, Karnataka, India', lat: '15.3502', lon: '76.1545', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Gadag', displayName: 'Gadag, Karnataka, India', lat: '15.4166', lon: '75.6260', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Haveri', displayName: 'Haveri, Karnataka, India', lat: '14.7951', lon: '75.3987', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Chikkaballapur', displayName: 'Chikkaballapur, Karnataka, India', lat: '13.4355', lon: '77.7315', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Kolar', displayName: 'Kolar, Karnataka, India', lat: '13.1360', lon: '78.1292', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Bidar', displayName: 'Bidar, Karnataka, India', lat: '17.9135', lon: '77.5301', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Yadgir', displayName: 'Yadgir, Karnataka, India', lat: '16.7630', lon: '77.1378', type: 'city', state: 'Karnataka', country: 'India' },
  { name: 'Chitradurga', displayName: 'Chitradurga, Karnataka, India', lat: '14.2226', lon: '76.3987', type: 'city', state: 'Karnataka', country: 'India' },
  
  // Gujarat cities from accident data
  { name: 'Mehsana', displayName: 'Mehsana, Gujarat, India', lat: '23.5880', lon: '72.3693', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Patan', displayName: 'Patan, Gujarat, India', lat: '23.8493', lon: '72.1266', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Banaskantha', displayName: 'Banaskantha, Gujarat, India', lat: '24.1753', lon: '72.4332', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Sabarkantha', displayName: 'Sabarkantha, Gujarat, India', lat: '23.6248', lon: '73.0456', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Aravalli', displayName: 'Aravalli, Gujarat, India', lat: '23.3000', lon: '73.1500', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Mahisagar', displayName: 'Mahisagar, Gujarat, India', lat: '23.1166', lon: '73.6333', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Kheda', displayName: 'Kheda, Gujarat, India', lat: '22.7507', lon: '72.6847', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Chhota Udepur', displayName: 'Chhota Udepur, Gujarat, India', lat: '22.3041', lon: '74.0111', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Dahod', displayName: 'Dahod, Gujarat, India', lat: '22.8372', lon: '74.2544', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Panchmahals', displayName: 'Panchmahals, Gujarat, India', lat: '22.7500', lon: '73.6000', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Narmada', displayName: 'Narmada, Gujarat, India', lat: '21.8878', lon: '73.4936', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Tapi', displayName: 'Tapi, Gujarat, India', lat: '21.1250', lon: '73.4250', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Dang', displayName: 'Dang, Gujarat, India', lat: '20.7539', lon: '73.6872', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Morbi', displayName: 'Morbi, Gujarat, India', lat: '22.8173', lon: '70.8378', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Surendranagar', displayName: 'Surendranagar, Gujarat, India', lat: '22.7282', lon: '71.6380', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Devbhumi Dwarka', displayName: 'Devbhumi Dwarka, Gujarat, India', lat: '22.2394', lon: '68.9678', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Porbandar', displayName: 'Porbandar, Gujarat, India', lat: '21.6417', lon: '69.6293', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Gir Somnath', displayName: 'Gir Somnath, Gujarat, India', lat: '21.0333', lon: '70.4833', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Amreli', displayName: 'Amreli, Gujarat, India', lat: '21.5999', lon: '71.2218', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Botad', displayName: 'Botad, Gujarat, India', lat: '22.1667', lon: '71.6667', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Bhavnagar', displayName: 'Bhavnagar, Gujarat, India', lat: '21.7645', lon: '72.1519', type: 'city', state: 'Gujarat', country: 'India' },
  { name: 'Kutch', displayName: 'Kutch, Gujarat, India', lat: '23.7337', lon: '69.8597', type: 'city', state: 'Gujarat', country: 'India', aliases: ['bhuj', 'kachchh'] },
  
  // Madhya Pradesh cities from accident data
  { name: 'Shahdol', displayName: 'Shahdol, Madhya Pradesh, India', lat: '23.2983', lon: '81.3596', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Umaria', displayName: 'Umaria, Madhya Pradesh, India', lat: '23.5248', lon: '80.8377', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Anuppur', displayName: 'Anuppur, Madhya Pradesh, India', lat: '23.1075', lon: '81.6895', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Dindori', displayName: 'Dindori, Madhya Pradesh, India', lat: '22.9455', lon: '81.0796', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Mandla', displayName: 'Mandla, Madhya Pradesh, India', lat: '22.5977', lon: '80.3792', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Balaghat', displayName: 'Balaghat, Madhya Pradesh, India', lat: '21.8126', lon: '80.1870', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Seoni', displayName: 'Seoni, Madhya Pradesh, India', lat: '22.0853', lon: '79.5466', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Chhindwara', displayName: 'Chhindwara, Madhya Pradesh, India', lat: '22.0574', lon: '78.9382', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Narsinghpur', displayName: 'Narsinghpur, Madhya Pradesh, India', lat: '22.9450', lon: '79.1900', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Hoshangabad', displayName: 'Hoshangabad, Madhya Pradesh, India', lat: '22.7536', lon: '77.7260', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Betul', displayName: 'Betul, Madhya Pradesh, India', lat: '21.9066', lon: '77.9014', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Burhanpur', displayName: 'Burhanpur, Madhya Pradesh, India', lat: '21.3104', lon: '76.2303', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Khandwa', displayName: 'Khandwa, Madhya Pradesh, India', lat: '21.8270', lon: '76.3526', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Khargone', displayName: 'Khargone, Madhya Pradesh, India', lat: '21.8236', lon: '75.6144', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Barwani', displayName: 'Barwani, Madhya Pradesh, India', lat: '22.0359', lon: '74.9030', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Dhar', displayName: 'Dhar, Madhya Pradesh, India', lat: '22.6012', lon: '75.3030', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Jhabua', displayName: 'Jhabua, Madhya Pradesh, India', lat: '22.7676', lon: '74.5912', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Alirajpur', displayName: 'Alirajpur, Madhya Pradesh, India', lat: '22.3063', lon: '74.3564', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Ratlam', displayName: 'Ratlam, Madhya Pradesh, India', lat: '23.3340', lon: '75.0475', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Mandsaur', displayName: 'Mandsaur, Madhya Pradesh, India', lat: '24.0717', lon: '75.0693', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Neemuch', displayName: 'Neemuch, Madhya Pradesh, India', lat: '24.4724', lon: '74.8680', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Shajapur', displayName: 'Shajapur, Madhya Pradesh, India', lat: '23.4267', lon: '76.2749', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Dewas', displayName: 'Dewas, Madhya Pradesh, India', lat: '22.9623', lon: '76.0508', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Sehore', displayName: 'Sehore, Madhya Pradesh, India', lat: '23.2000', lon: '77.0833', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Raisen', displayName: 'Raisen, Madhya Pradesh, India', lat: '23.3296', lon: '77.7871', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Vidisha', displayName: 'Vidisha, Madhya Pradesh, India', lat: '23.5251', lon: '77.8081', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Ashoknagar', displayName: 'Ashoknagar, Madhya Pradesh, India', lat: '24.5737', lon: '77.7302', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Guna', displayName: 'Guna, Madhya Pradesh, India', lat: '24.6476', lon: '77.3113', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Shivpuri', displayName: 'Shivpuri, Madhya Pradesh, India', lat: '25.4236', lon: '77.6591', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Morena', displayName: 'Morena, Madhya Pradesh, India', lat: '26.4972', lon: '77.9873', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Bhind', displayName: 'Bhind, Madhya Pradesh, India', lat: '26.5628', lon: '78.7872', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Datia', displayName: 'Datia, Madhya Pradesh, India', lat: '25.6654', lon: '78.4600', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Chhatarpur', displayName: 'Chhatarpur, Madhya Pradesh, India', lat: '24.9166', lon: '79.5916', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Tikamgarh', displayName: 'Tikamgarh, Madhya Pradesh, India', lat: '24.7434', lon: '78.8308', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Niwari', displayName: 'Niwari, Madhya Pradesh, India', lat: '25.1333', lon: '78.3833', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Panna', displayName: 'Panna, Madhya Pradesh, India', lat: '24.7179', lon: '80.1829', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Damoh', displayName: 'Damoh, Madhya Pradesh, India', lat: '23.8333', lon: '79.4500', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Katni', displayName: 'Katni, Madhya Pradesh, India', lat: '23.8342', lon: '80.3933', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Maihar', displayName: 'Maihar, Madhya Pradesh, India', lat: '24.2645', lon: '80.7614', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  { name: 'Singrauli', displayName: 'Singrauli, Madhya Pradesh, India', lat: '24.1996', lon: '82.6744', type: 'city', state: 'Madhya Pradesh', country: 'India' },
  
  // Bihar cities from accident data
  { name: 'Saran', displayName: 'Saran, Bihar, India', lat: '25.9174', lon: '84.7538', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Siwan', displayName: 'Siwan, Bihar, India', lat: '26.2230', lon: '84.3570', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Gopalganj', displayName: 'Gopalganj, Bihar, India', lat: '26.4696', lon: '84.4436', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Buxar', displayName: 'Buxar, Bihar, India', lat: '25.5591', lon: '83.9763', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Bhojpur', displayName: 'Bhojpur, Bihar, India', lat: '25.5557', lon: '84.4525', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Rohtas', displayName: 'Rohtas, Bihar, India', lat: '24.9745', lon: '84.0237', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Kaimur', displayName: 'Kaimur, Bihar, India', lat: '25.0450', lon: '83.5833', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Aurangabad Bihar', displayName: 'Aurangabad, Bihar, India', lat: '24.7520', lon: '84.3749', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Arwal', displayName: 'Arwal, Bihar, India', lat: '25.2452', lon: '84.6911', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Jehanabad', displayName: 'Jehanabad, Bihar, India', lat: '25.2129', lon: '84.9869', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Nalanda', displayName: 'Nalanda, Bihar, India', lat: '25.1335', lon: '85.4437', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Sheikhpura', displayName: 'Sheikhpura, Bihar, India', lat: '25.1409', lon: '85.8491', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Lakhisarai', displayName: 'Lakhisarai, Bihar, India', lat: '25.1593', lon: '86.0951', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Jamui', displayName: 'Jamui, Bihar, India', lat: '24.9194', lon: '86.2248', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Munger', displayName: 'Munger, Bihar, India', lat: '25.3708', lon: '86.4735', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Banka', displayName: 'Banka, Bihar, India', lat: '24.8857', lon: '86.9193', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Nawada', displayName: 'Nawada, Bihar, India', lat: '24.8860', lon: '85.5412', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Samastipur', displayName: 'Samastipur, Bihar, India', lat: '25.8505', lon: '85.7800', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Begusarai', displayName: 'Begusarai, Bihar, India', lat: '25.4181', lon: '86.1272', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Khagaria', displayName: 'Khagaria, Bihar, India', lat: '25.5019', lon: '86.4693', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Vaishali', displayName: 'Vaishali, Bihar, India', lat: '25.6796', lon: '85.1979', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Sitamarhi', displayName: 'Sitamarhi, Bihar, India', lat: '26.5948', lon: '85.4804', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Sheohar', displayName: 'Sheohar, Bihar, India', lat: '26.5167', lon: '85.3000', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'East Champaran', displayName: 'East Champaran, Bihar, India', lat: '26.6477', lon: '84.9161', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'West Champaran', displayName: 'West Champaran, Bihar, India', lat: '26.7315', lon: '84.4348', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Madhubani', displayName: 'Madhubani, Bihar, India', lat: '26.3559', lon: '86.0718', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Supaul', displayName: 'Supaul, Bihar, India', lat: '26.1239', lon: '86.6041', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Saharsa', displayName: 'Saharsa, Bihar, India', lat: '25.8833', lon: '86.6000', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Madhepura', displayName: 'Madhepura, Bihar, India', lat: '25.9214', lon: '86.7929', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Katihar', displayName: 'Katihar, Bihar, India', lat: '25.5545', lon: '87.5782', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Araria', displayName: 'Araria, Bihar, India', lat: '26.1486', lon: '87.5145', type: 'city', state: 'Bihar', country: 'India' },
  { name: 'Kishanganj', displayName: 'Kishanganj, Bihar, India', lat: '26.1098', lon: '87.9402', type: 'city', state: 'Bihar', country: 'India' },
  
  // Kerala cities from accident data
  { name: 'Palakkad', displayName: 'Palakkad, Kerala, India', lat: '10.7867', lon: '76.6548', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Malappuram', displayName: 'Malappuram, Kerala, India', lat: '11.0509', lon: '76.0711', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Wayanad', displayName: 'Wayanad, Kerala, India', lat: '11.6854', lon: '76.1320', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Kannur', displayName: 'Kannur, Kerala, India', lat: '11.8745', lon: '75.3704', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Kasaragod', displayName: 'Kasaragod, Kerala, India', lat: '12.4996', lon: '74.9869', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Idukki', displayName: 'Idukki, Kerala, India', lat: '9.8494', lon: '76.9730', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Ernakulam', displayName: 'Ernakulam, Kerala, India', lat: '9.9816', lon: '76.2999', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Alappuzha', displayName: 'Alappuzha, Kerala, India', lat: '9.4981', lon: '76.3388', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Kottayam', displayName: 'Kottayam, Kerala, India', lat: '9.5916', lon: '76.5222', type: 'city', state: 'Kerala', country: 'India' },
  { name: 'Pathanamthitta', displayName: 'Pathanamthitta, Kerala, India', lat: '9.2648', lon: '76.7870', type: 'city', state: 'Kerala', country: 'India' },
  
  // Andhra Pradesh cities from accident data
  { name: 'Anantapur', displayName: 'Anantapur, Andhra Pradesh, India', lat: '14.6819', lon: '77.6006', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Chittoor', displayName: 'Chittoor, Andhra Pradesh, India', lat: '13.2172', lon: '79.1003', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Kadapa', displayName: 'Kadapa, Andhra Pradesh, India', lat: '14.4673', lon: '78.8242', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Prakasam', displayName: 'Prakasam, Andhra Pradesh, India', lat: '15.3500', lon: '79.4167', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'SPSR Nellore', displayName: 'SPSR Nellore, Andhra Pradesh, India', lat: '14.4426', lon: '79.9865', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'West Godavari', displayName: 'West Godavari, Andhra Pradesh, India', lat: '16.8333', lon: '81.3333', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'East Godavari', displayName: 'East Godavari, Andhra Pradesh, India', lat: '17.0000', lon: '82.0000', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Krishna', displayName: 'Krishna, Andhra Pradesh, India', lat: '16.5000', lon: '80.7500', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Srikakulam', displayName: 'Srikakulam, Andhra Pradesh, India', lat: '18.2949', lon: '83.8938', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  { name: 'Vizianagaram', displayName: 'Vizianagaram, Andhra Pradesh, India', lat: '18.1066', lon: '83.4205', type: 'city', state: 'Andhra Pradesh', country: 'India' },
  
  // Telangana cities from accident data
  { name: 'Nizamabad', displayName: 'Nizamabad, Telangana, India', lat: '18.6725', lon: '78.0940', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Kamareddy', displayName: 'Kamareddy, Telangana, India', lat: '18.3250', lon: '78.3350', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Sangareddy', displayName: 'Sangareddy, Telangana, India', lat: '17.6244', lon: '78.0865', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Medak', displayName: 'Medak, Telangana, India', lat: '18.0453', lon: '78.2670', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Siddipet', displayName: 'Siddipet, Telangana, India', lat: '18.1019', lon: '78.8499', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Yadadri Bhuvanagiri', displayName: 'Yadadri Bhuvanagiri, Telangana, India', lat: '17.6000', lon: '78.9333', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Rangareddy', displayName: 'Rangareddy, Telangana, India', lat: '17.2543', lon: '78.2828', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Medchal-Malkajgiri', displayName: 'Medchal-Malkajgiri, Telangana, India', lat: '17.5417', lon: '78.4767', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Vikarabad', displayName: 'Vikarabad, Telangana, India', lat: '17.3381', lon: '77.9048', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Mahabubnagar', displayName: 'Mahabubnagar, Telangana, India', lat: '16.7488', lon: '77.9850', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Nagarkurnool', displayName: 'Nagarkurnool, Telangana, India', lat: '16.4833', lon: '78.3167', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Wanaparthy', displayName: 'Wanaparthy, Telangana, India', lat: '16.3667', lon: '78.0667', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Jogulamba Gadwal', displayName: 'Jogulamba Gadwal, Telangana, India', lat: '16.2333', lon: '77.8000', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Nalgonda', displayName: 'Nalgonda, Telangana, India', lat: '17.0575', lon: '79.2690', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Suryapet', displayName: 'Suryapet, Telangana, India', lat: '17.1373', lon: '79.6283', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Khammam', displayName: 'Khammam, Telangana, India', lat: '17.2473', lon: '80.1514', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Bhadradri Kothagudem', displayName: 'Bhadradri Kothagudem, Telangana, India', lat: '17.5540', lon: '80.6196', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Mahabubabad', displayName: 'Mahabubabad, Telangana, India', lat: '17.5983', lon: '80.0017', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Jangaon', displayName: 'Jangaon, Telangana, India', lat: '17.7257', lon: '79.1719', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Jayashankar Bhupalpally', displayName: 'Jayashankar Bhupalpally, Telangana, India', lat: '18.4333', lon: '80.0333', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Mulugu', displayName: 'Mulugu, Telangana, India', lat: '18.1833', lon: '80.5333', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Mancherial', displayName: 'Mancherial, Telangana, India', lat: '18.8651', lon: '79.4617', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Peddapalli', displayName: 'Peddapalli, Telangana, India', lat: '18.6167', lon: '79.3667', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Rajanna Sircilla', displayName: 'Rajanna Sircilla, Telangana, India', lat: '18.3833', lon: '78.8333', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Jagtial', displayName: 'Jagtial, Telangana, India', lat: '18.7950', lon: '78.9133', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Nirmal', displayName: 'Nirmal, Telangana, India', lat: '19.0950', lon: '78.3433', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Adilabad', displayName: 'Adilabad, Telangana, India', lat: '19.6640', lon: '78.5320', type: 'city', state: 'Telangana', country: 'India' },
  { name: 'Kumuram Bheem', displayName: 'Kumuram Bheem, Telangana, India', lat: '19.6000', lon: '79.3167', type: 'city', state: 'Telangana', country: 'India' },
  
  // West Bengal cities from accident data
  { name: 'Bardhaman', displayName: 'Bardhaman, West Bengal, India', lat: '23.2324', lon: '87.8615', type: 'city', state: 'West Bengal', country: 'India', aliases: ['burdwan'] },
  { name: 'Purba Bardhaman', displayName: 'Purba Bardhaman, West Bengal, India', lat: '23.2324', lon: '87.8615', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Paschim Bardhaman', displayName: 'Paschim Bardhaman, West Bengal, India', lat: '23.5000', lon: '87.1667', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Hooghly', displayName: 'Hooghly, West Bengal, India', lat: '22.9000', lon: '88.3833', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'North 24 Parganas', displayName: 'North 24 Parganas, West Bengal, India', lat: '22.6200', lon: '88.4600', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'South 24 Parganas', displayName: 'South 24 Parganas, West Bengal, India', lat: '22.1351', lon: '88.4018', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Nadia', displayName: 'Nadia, West Bengal, India', lat: '23.4710', lon: '88.5565', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Murshidabad', displayName: 'Murshidabad, West Bengal, India', lat: '24.1854', lon: '88.2461', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Birbhum', displayName: 'Birbhum, West Bengal, India', lat: '23.8333', lon: '87.5333', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Jhargram', displayName: 'Jhargram, West Bengal, India', lat: '22.4547', lon: '86.9974', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Paschim Medinipur', displayName: 'Paschim Medinipur, West Bengal, India', lat: '22.4167', lon: '87.3167', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Purba Medinipur', displayName: 'Purba Medinipur, West Bengal, India', lat: '22.0500', lon: '87.9000', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Bankura', displayName: 'Bankura, West Bengal, India', lat: '23.2333', lon: '87.0667', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Purulia', displayName: 'Purulia, West Bengal, India', lat: '23.3333', lon: '86.3667', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Jalpaiguri', displayName: 'Jalpaiguri, West Bengal, India', lat: '26.5167', lon: '88.7333', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Alipurduar', displayName: 'Alipurduar, West Bengal, India', lat: '26.4833', lon: '89.5167', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Cooch Behar', displayName: 'Cooch Behar, West Bengal, India', lat: '26.3167', lon: '89.4500', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Uttar Dinajpur', displayName: 'Uttar Dinajpur, West Bengal, India', lat: '26.2333', lon: '88.7167', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Dakshin Dinajpur', displayName: 'Dakshin Dinajpur, West Bengal, India', lat: '25.2167', lon: '88.7667', type: 'city', state: 'West Bengal', country: 'India' },
  { name: 'Kalimpong', displayName: 'Kalimpong, West Bengal, India', lat: '27.0667', lon: '88.4667', type: 'city', state: 'West Bengal', country: 'India' },
  
  // Odisha cities from accident data
  { name: 'Khordha', displayName: 'Khordha, Odisha, India', lat: '20.1833', lon: '85.6167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Puri District', displayName: 'Puri District, Odisha, India', lat: '19.8000', lon: '85.8333', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Jagatsinghpur', displayName: 'Jagatsinghpur, Odisha, India', lat: '20.2500', lon: '86.1667', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Kendrapara', displayName: 'Kendrapara, Odisha, India', lat: '20.5000', lon: '86.4167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Jajpur', displayName: 'Jajpur, Odisha, India', lat: '20.8333', lon: '86.3333', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Bhadrak', displayName: 'Bhadrak, Odisha, India', lat: '21.0500', lon: '86.5167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Balasore', displayName: 'Balasore, Odisha, India', lat: '21.4942', lon: '86.9317', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Mayurbhanj', displayName: 'Mayurbhanj, Odisha, India', lat: '21.9333', lon: '86.7333', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Keonjhar', displayName: 'Keonjhar, Odisha, India', lat: '21.6333', lon: '85.5833', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Dhenkanal', displayName: 'Dhenkanal, Odisha, India', lat: '20.6667', lon: '85.6000', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Angul', displayName: 'Angul, Odisha, India', lat: '20.8500', lon: '85.1000', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Sundargarh', displayName: 'Sundargarh, Odisha, India', lat: '22.1167', lon: '84.0333', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Jharsuguda', displayName: 'Jharsuguda, Odisha, India', lat: '21.8550', lon: '84.0267', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Bargarh', displayName: 'Bargarh, Odisha, India', lat: '21.3333', lon: '83.6167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Bolangir', displayName: 'Bolangir, Odisha, India', lat: '20.7000', lon: '83.4833', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Sonepur', displayName: 'Sonepur, Odisha, India', lat: '20.8333', lon: '83.9167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Nuapada', displayName: 'Nuapada, Odisha, India', lat: '20.8333', lon: '82.5333', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Kalahandi', displayName: 'Kalahandi, Odisha, India', lat: '19.9000', lon: '83.1667', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Nabarangpur', displayName: 'Nabarangpur, Odisha, India', lat: '19.2333', lon: '82.5500', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Koraput', displayName: 'Koraput, Odisha, India', lat: '18.8133', lon: '82.7117', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Malkangiri', displayName: 'Malkangiri, Odisha, India', lat: '18.3500', lon: '81.8833', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Rayagada', displayName: 'Rayagada, Odisha, India', lat: '19.1700', lon: '83.4167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Gajapati', displayName: 'Gajapati, Odisha, India', lat: '19.2000', lon: '84.0500', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Ganjam', displayName: 'Ganjam, Odisha, India', lat: '19.3833', lon: '85.0500', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Kandhamal', displayName: 'Kandhamal, Odisha, India', lat: '20.1000', lon: '84.0667', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Nayagarh', displayName: 'Nayagarh, Odisha, India', lat: '20.1333', lon: '85.1000', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Boudh', displayName: 'Boudh, Odisha, India', lat: '20.8333', lon: '84.3167', type: 'city', state: 'Odisha', country: 'India' },
  { name: 'Deogarh', displayName: 'Deogarh, Odisha, India', lat: '21.5333', lon: '84.7333', type: 'city', state: 'Odisha', country: 'India' },
  
  // Jharkhand cities from accident data
  { name: 'Hazaribagh', displayName: 'Hazaribagh, Jharkhand, India', lat: '23.9925', lon: '85.3637', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Koderma', displayName: 'Koderma, Jharkhand, India', lat: '24.4667', lon: '85.5833', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Giridih', displayName: 'Giridih, Jharkhand, India', lat: '24.1833', lon: '86.3000', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Deoghar', displayName: 'Deoghar, Jharkhand, India', lat: '24.4850', lon: '86.6964', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Dumka', displayName: 'Dumka, Jharkhand, India', lat: '24.2667', lon: '87.2500', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Pakur', displayName: 'Pakur, Jharkhand, India', lat: '24.6333', lon: '87.8500', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Godda', displayName: 'Godda, Jharkhand, India', lat: '24.8333', lon: '87.2167', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Sahebganj', displayName: 'Sahebganj, Jharkhand, India', lat: '25.2500', lon: '87.6333', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Ramgarh', displayName: 'Ramgarh, Jharkhand, India', lat: '23.6333', lon: '85.5167', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Chatra', displayName: 'Chatra, Jharkhand, India', lat: '24.2050', lon: '84.8706', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Latehar', displayName: 'Latehar, Jharkhand, India', lat: '23.7500', lon: '84.5000', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Palamu', displayName: 'Palamu, Jharkhand, India', lat: '24.0833', lon: '84.0667', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Garhwa', displayName: 'Garhwa, Jharkhand, India', lat: '24.1667', lon: '83.8000', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Lohardaga', displayName: 'Lohardaga, Jharkhand, India', lat: '23.4333', lon: '84.6833', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Gumla', displayName: 'Gumla, Jharkhand, India', lat: '23.0442', lon: '84.5416', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Simdega', displayName: 'Simdega, Jharkhand, India', lat: '22.6167', lon: '84.5000', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Khunti', displayName: 'Khunti, Jharkhand, India', lat: '23.0667', lon: '85.2833', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'Saraikela Kharsawan', displayName: 'Saraikela Kharsawan, Jharkhand, India', lat: '22.7000', lon: '85.9333', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'East Singhbhum', displayName: 'East Singhbhum, Jharkhand, India', lat: '22.8000', lon: '86.2000', type: 'city', state: 'Jharkhand', country: 'India' },
  { name: 'West Singhbhum', displayName: 'West Singhbhum, Jharkhand, India', lat: '22.4500', lon: '85.6333', type: 'city', state: 'Jharkhand', country: 'India' },
  
  // Assam cities from accident data
  { name: 'Kamrup Metropolitan', displayName: 'Kamrup Metropolitan, Assam, India', lat: '26.1445', lon: '91.7362', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Kamrup', displayName: 'Kamrup, Assam, India', lat: '26.2333', lon: '91.5167', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Nalbari', displayName: 'Nalbari, Assam, India', lat: '26.4500', lon: '91.4333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Barpeta', displayName: 'Barpeta, Assam, India', lat: '26.3167', lon: '91.0000', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Bajali', displayName: 'Bajali, Assam, India', lat: '26.4167', lon: '90.9500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Bongaigaon', displayName: 'Bongaigaon, Assam, India', lat: '26.4833', lon: '90.5500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Chirang', displayName: 'Chirang, Assam, India', lat: '26.5000', lon: '90.3167', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Kokrajhar', displayName: 'Kokrajhar, Assam, India', lat: '26.4000', lon: '90.2667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Dhubri', displayName: 'Dhubri, Assam, India', lat: '26.0167', lon: '89.9833', type: 'city', state: 'Assam', country: 'India' },
  { name: 'South Salmara-Mankachar', displayName: 'South Salmara-Mankachar, Assam, India', lat: '25.6000', lon: '89.8333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Goalpara', displayName: 'Goalpara, Assam, India', lat: '26.1667', lon: '90.6333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Darrang', displayName: 'Darrang, Assam, India', lat: '26.5167', lon: '92.0167', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Udalguri', displayName: 'Udalguri, Assam, India', lat: '26.7500', lon: '92.1000', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Baksa', displayName: 'Baksa, Assam, India', lat: '26.6833', lon: '91.2333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Tamulpur', displayName: 'Tamulpur, Assam, India', lat: '26.6333', lon: '91.5333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Sonitpur', displayName: 'Sonitpur, Assam, India', lat: '26.7500', lon: '92.9167', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Biswanath', displayName: 'Biswanath, Assam, India', lat: '26.6500', lon: '93.1500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Lakhimpur', displayName: 'Lakhimpur, Assam, India', lat: '27.2333', lon: '94.1000', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Dhemaji', displayName: 'Dhemaji, Assam, India', lat: '27.4833', lon: '94.5667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Nagaon', displayName: 'Nagaon, Assam, India', lat: '26.3500', lon: '92.6833', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Morigaon', displayName: 'Morigaon, Assam, India', lat: '26.2500', lon: '92.3333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Hojai', displayName: 'Hojai, Assam, India', lat: '26.0000', lon: '92.8500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Karbi Anglong', displayName: 'Karbi Anglong, Assam, India', lat: '26.1000', lon: '93.5167', type: 'city', state: 'Assam', country: 'India' },
  { name: 'West Karbi Anglong', displayName: 'West Karbi Anglong, Assam, India', lat: '25.7833', lon: '93.2667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Dima Hasao', displayName: 'Dima Hasao, Assam, India', lat: '25.5000', lon: '93.0500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Cachar', displayName: 'Cachar, Assam, India', lat: '24.7833', lon: '92.8500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Hailakandi', displayName: 'Hailakandi, Assam, India', lat: '24.6833', lon: '92.5667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Karimganj', displayName: 'Karimganj, Assam, India', lat: '24.8667', lon: '92.3500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Golaghat', displayName: 'Golaghat, Assam, India', lat: '26.5167', lon: '93.9667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Jorhat', displayName: 'Jorhat, Assam, India', lat: '26.7500', lon: '94.2000', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Majuli', displayName: 'Majuli, Assam, India', lat: '26.9500', lon: '94.1667', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Sivasagar', displayName: 'Sivasagar, Assam, India', lat: '26.9833', lon: '94.6333', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Charaideo', displayName: 'Charaideo, Assam, India', lat: '27.0500', lon: '94.8500', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Dibrugarh', displayName: 'Dibrugarh, Assam, India', lat: '27.4728', lon: '94.9119', type: 'city', state: 'Assam', country: 'India' },
  { name: 'Tinsukia', displayName: 'Tinsukia, Assam, India', lat: '27.4833', lon: '95.3500', type: 'city', state: 'Assam', country: 'India' },
  
  // Punjab cities from accident data
  { name: 'Amritsar District', displayName: 'Amritsar District, Punjab, India', lat: '31.6340', lon: '74.8723', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Gurdaspur', displayName: 'Gurdaspur, Punjab, India', lat: '32.0379', lon: '75.4029', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Kapurthala', displayName: 'Kapurthala, Punjab, India', lat: '31.3808', lon: '75.3809', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Hoshiarpur', displayName: 'Hoshiarpur, Punjab, India', lat: '31.5143', lon: '75.9115', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Nawanshahr', displayName: 'Nawanshahr, Punjab, India', lat: '31.1257', lon: '76.1195', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Rupnagar', displayName: 'Rupnagar, Punjab, India', lat: '30.9660', lon: '76.5260', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Mohali', displayName: 'Mohali, Punjab, India', lat: '30.7046', lon: '76.7179', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Fatehgarh Sahib', displayName: 'Fatehgarh Sahib, Punjab, India', lat: '30.6449', lon: '76.3927', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Sangrur', displayName: 'Sangrur, Punjab, India', lat: '30.2477', lon: '75.8421', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Barnala', displayName: 'Barnala, Punjab, India', lat: '30.3760', lon: '75.5476', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Mansa', displayName: 'Mansa, Punjab, India', lat: '29.9988', lon: '75.4030', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Fazilka', displayName: 'Fazilka, Punjab, India', lat: '30.4000', lon: '74.0333', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Muktsar', displayName: 'Muktsar, Punjab, India', lat: '30.4781', lon: '74.5178', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Faridkot', displayName: 'Faridkot, Punjab, India', lat: '30.6762', lon: '74.7561', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Firozpur', displayName: 'Firozpur, Punjab, India', lat: '30.9293', lon: '74.6200', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Moga', displayName: 'Moga, Punjab, India', lat: '30.8141', lon: '75.1720', type: 'city', state: 'Punjab', country: 'India' },
  { name: 'Tarn Taran', displayName: 'Tarn Taran, Punjab, India', lat: '31.4508', lon: '74.9279', type: 'city', state: 'Punjab', country: 'India' },
  
  // Haryana cities from accident data
  { name: 'Yamunanagar', displayName: 'Yamunanagar, Haryana, India', lat: '30.1290', lon: '77.2674', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Kurukshetra', displayName: 'Kurukshetra, Haryana, India', lat: '29.9695', lon: '76.8783', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Kaithal', displayName: 'Kaithal, Haryana, India', lat: '29.8015', lon: '76.3998', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Jind', displayName: 'Jind, Haryana, India', lat: '29.3162', lon: '76.3154', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Fatehabad', displayName: 'Fatehabad, Haryana, India', lat: '29.5151', lon: '75.4542', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Sirsa', displayName: 'Sirsa, Haryana, India', lat: '29.5350', lon: '75.0267', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Bhiwani', displayName: 'Bhiwani, Haryana, India', lat: '28.7930', lon: '76.1325', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Charkhi Dadri', displayName: 'Charkhi Dadri, Haryana, India', lat: '28.5910', lon: '76.2711', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Mahendragarh', displayName: 'Mahendragarh, Haryana, India', lat: '28.2833', lon: '76.1500', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Rewari', displayName: 'Rewari, Haryana, India', lat: '28.1900', lon: '76.6194', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Jhajjar', displayName: 'Jhajjar, Haryana, India', lat: '28.6061', lon: '76.6557', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Palwal', displayName: 'Palwal, Haryana, India', lat: '28.1447', lon: '77.3320', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Nuh', displayName: 'Nuh, Haryana, India', lat: '28.1019', lon: '77.0054', type: 'city', state: 'Haryana', country: 'India' },
  { name: 'Panchkula', displayName: 'Panchkula, Haryana, India', lat: '30.6942', lon: '76.8606', type: 'city', state: 'Haryana', country: 'India' },
  
  // Chhattisgarh cities from accident data
  { name: 'Korba', displayName: 'Korba, Chhattisgarh, India', lat: '22.3458', lon: '82.6830', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Janjgir-Champa', displayName: 'Janjgir-Champa, Chhattisgarh, India', lat: '22.0167', lon: '82.5667', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Mungeli', displayName: 'Mungeli, Chhattisgarh, India', lat: '22.0667', lon: '81.6833', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Kabirdham', displayName: 'Kabirdham, Chhattisgarh, India', lat: '22.1000', lon: '81.2333', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Rajnandgaon', displayName: 'Rajnandgaon, Chhattisgarh, India', lat: '21.0972', lon: '81.0278', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Durg', displayName: 'Durg, Chhattisgarh, India', lat: '21.1904', lon: '81.2849', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Balod', displayName: 'Balod, Chhattisgarh, India', lat: '20.7333', lon: '81.2000', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Bemetara', displayName: 'Bemetara, Chhattisgarh, India', lat: '21.7167', lon: '81.5333', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Dhamtari', displayName: 'Dhamtari, Chhattisgarh, India', lat: '20.7076', lon: '81.5498', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Gariaband', displayName: 'Gariaband, Chhattisgarh, India', lat: '20.6333', lon: '82.0667', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Mahasamund', displayName: 'Mahasamund, Chhattisgarh, India', lat: '21.1167', lon: '82.1000', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Balodabazar', displayName: 'Balodabazar, Chhattisgarh, India', lat: '21.6667', lon: '82.1500', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Surguja', displayName: 'Surguja, Chhattisgarh, India', lat: '23.1167', lon: '83.0833', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Surajpur', displayName: 'Surajpur, Chhattisgarh, India', lat: '23.2167', lon: '82.8667', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Balrampur Chhattisgarh', displayName: 'Balrampur, Chhattisgarh, India', lat: '23.5000', lon: '83.6000', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Koriya', displayName: 'Koriya, Chhattisgarh, India', lat: '23.2500', lon: '82.5833', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Jashpur', displayName: 'Jashpur, Chhattisgarh, India', lat: '22.8833', lon: '84.1333', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Raigarh Chhattisgarh', displayName: 'Raigarh, Chhattisgarh, India', lat: '21.8974', lon: '83.3950', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Bastar', displayName: 'Bastar, Chhattisgarh, India', lat: '19.1000', lon: '82.0333', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Kondagaon', displayName: 'Kondagaon, Chhattisgarh, India', lat: '19.5833', lon: '81.6667', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Narayanpur', displayName: 'Narayanpur, Chhattisgarh, India', lat: '19.7333', lon: '81.2333', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Kanker', displayName: 'Kanker, Chhattisgarh, India', lat: '20.2667', lon: '81.4833', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Dantewada', displayName: 'Dantewada, Chhattisgarh, India', lat: '18.8833', lon: '81.3500', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Sukma', displayName: 'Sukma, Chhattisgarh, India', lat: '18.3833', lon: '81.6500', type: 'city', state: 'Chhattisgarh', country: 'India' },
  { name: 'Bijapur Chhattisgarh', displayName: 'Bijapur, Chhattisgarh, India', lat: '18.8500', lon: '80.7667', type: 'city', state: 'Chhattisgarh', country: 'India' },
  
  // All Indian States as locations
  { name: 'Jammu and Kashmir', displayName: 'Jammu and Kashmir, India', lat: '33.7782', lon: '76.5762', type: 'state', state: 'Jammu and Kashmir', country: 'India', aliases: ['j&k', 'jk'] },
  { name: 'Ladakh', displayName: 'Ladakh, India', lat: '34.1526', lon: '77.5770', type: 'state', state: 'Ladakh', country: 'India' },
  { name: 'Himachal Pradesh', displayName: 'Himachal Pradesh, India', lat: '31.1048', lon: '77.1734', type: 'state', state: 'Himachal Pradesh', country: 'India', aliases: ['hp'] },
  { name: 'Punjab', displayName: 'Punjab, India', lat: '31.1471', lon: '75.3412', type: 'state', state: 'Punjab', country: 'India' },
  { name: 'Uttarakhand', displayName: 'Uttarakhand, India', lat: '30.0668', lon: '79.0193', type: 'state', state: 'Uttarakhand', country: 'India', aliases: ['uk'] },
  { name: 'Haryana', displayName: 'Haryana, India', lat: '29.0588', lon: '76.0856', type: 'state', state: 'Haryana', country: 'India' },
  { name: 'Rajasthan', displayName: 'Rajasthan, India', lat: '27.0238', lon: '74.2179', type: 'state', state: 'Rajasthan', country: 'India' },
  { name: 'Uttar Pradesh', displayName: 'Uttar Pradesh, India', lat: '26.8467', lon: '80.9462', type: 'state', state: 'Uttar Pradesh', country: 'India', aliases: ['up'] },
  { name: 'Bihar', displayName: 'Bihar, India', lat: '25.0961', lon: '85.3131', type: 'state', state: 'Bihar', country: 'India' },
  { name: 'Sikkim', displayName: 'Sikkim, India', lat: '27.5330', lon: '88.5122', type: 'state', state: 'Sikkim', country: 'India' },
  { name: 'Arunachal Pradesh', displayName: 'Arunachal Pradesh, India', lat: '28.2180', lon: '94.7278', type: 'state', state: 'Arunachal Pradesh', country: 'India', aliases: ['ap'] },
  { name: 'Nagaland', displayName: 'Nagaland, India', lat: '26.1584', lon: '94.5624', type: 'state', state: 'Nagaland', country: 'India' },
  { name: 'Manipur', displayName: 'Manipur, India', lat: '24.6637', lon: '93.9063', type: 'state', state: 'Manipur', country: 'India' },
  { name: 'Mizoram', displayName: 'Mizoram, India', lat: '23.1645', lon: '92.9376', type: 'state', state: 'Mizoram', country: 'India' },
  { name: 'Tripura', displayName: 'Tripura, India', lat: '23.9408', lon: '91.9882', type: 'state', state: 'Tripura', country: 'India' },
  { name: 'Meghalaya', displayName: 'Meghalaya, India', lat: '25.4670', lon: '91.3662', type: 'state', state: 'Meghalaya', country: 'India' },
  { name: 'Assam', displayName: 'Assam, India', lat: '26.2006', lon: '92.9376', type: 'state', state: 'Assam', country: 'India' },
  { name: 'West Bengal', displayName: 'West Bengal, India', lat: '22.9868', lon: '87.8550', type: 'state', state: 'West Bengal', country: 'India', aliases: ['wb'] },
  { name: 'Jharkhand', displayName: 'Jharkhand, India', lat: '23.6102', lon: '85.2799', type: 'state', state: 'Jharkhand', country: 'India' },
  { name: 'Odisha', displayName: 'Odisha, India', lat: '20.9517', lon: '85.0985', type: 'state', state: 'Odisha', country: 'India', aliases: ['orissa'] },
  { name: 'Chhattisgarh', displayName: 'Chhattisgarh, India', lat: '21.2787', lon: '81.8661', type: 'state', state: 'Chhattisgarh', country: 'India', aliases: ['cg'] },
  { name: 'Madhya Pradesh', displayName: 'Madhya Pradesh, India', lat: '22.9734', lon: '78.6569', type: 'state', state: 'Madhya Pradesh', country: 'India', aliases: ['mp'] },
  { name: 'Gujarat', displayName: 'Gujarat, India', lat: '22.2587', lon: '71.1924', type: 'state', state: 'Gujarat', country: 'India' },
  { name: 'Maharashtra', displayName: 'Maharashtra, India', lat: '19.7515', lon: '75.7139', type: 'state', state: 'Maharashtra', country: 'India' },
  { name: 'Andhra Pradesh', displayName: 'Andhra Pradesh, India', lat: '15.9129', lon: '79.7400', type: 'state', state: 'Andhra Pradesh', country: 'India', aliases: ['ap'] },
  { name: 'Karnataka', displayName: 'Karnataka, India', lat: '15.3173', lon: '75.7139', type: 'state', state: 'Karnataka', country: 'India' },
  { name: 'Goa', displayName: 'Goa, India', lat: '15.2993', lon: '74.1240', type: 'state', state: 'Goa', country: 'India' },
  { name: 'Kerala', displayName: 'Kerala, India', lat: '10.8505', lon: '76.2711', type: 'state', state: 'Kerala', country: 'India' },
  { name: 'Tamil Nadu', displayName: 'Tamil Nadu, India', lat: '11.1271', lon: '78.6569', type: 'state', state: 'Tamil Nadu', country: 'India', aliases: ['tn'] },
  { name: 'Telangana', displayName: 'Telangana, India', lat: '18.1124', lon: '79.0193', type: 'state', state: 'Telangana', country: 'India' },
  { name: 'Puducherry', displayName: 'Puducherry, India', lat: '11.9416', lon: '79.8083', type: 'state', state: 'Puducherry', country: 'India', aliases: ['pondicherry'] },
  { name: 'Andaman and Nicobar Islands', displayName: 'Andaman and Nicobar Islands, India', lat: '11.7401', lon: '92.6586', type: 'state', state: 'Andaman and Nicobar Islands', country: 'India' },
  { name: 'Lakshadweep', displayName: 'Lakshadweep, India', lat: '10.5667', lon: '72.6417', type: 'state', state: 'Lakshadweep', country: 'India' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', displayName: 'Dadra and Nagar Haveli and Daman and Diu, India', lat: '20.1809', lon: '73.0169', type: 'state', state: 'Dadra and Nagar Haveli and Daman and Diu', country: 'India' },
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

// Merge local results with API results, prioritizing API for comprehensive coverage
export function mergeResults(
  localResults: NominatimResult[],
  apiResults: NominatimResult[],
  maxResults: number = 15
): NominatimResult[] {
  const seen = new Set<string>();
  const merged: NominatimResult[] = [];

  // Helper to create unique key
  const getKey = (result: NominatimResult) => {
    // Use rounded coordinates to handle slight variations
    const lat = parseFloat(result.lat).toFixed(3);
    const lon = parseFloat(result.lon).toFixed(3);
    return `${lat}-${lon}`;
  };

  // Add API results first (more comprehensive and up-to-date)
  for (const result of apiResults) {
    const key = getKey(result);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    }
  }

  // Add local results that don't overlap (for cached cities)
  for (const result of localResults) {
    const key = getKey(result);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(result);
    }
  }

  return merged.slice(0, maxResults);
}
