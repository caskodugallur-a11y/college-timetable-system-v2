// ============================================
// API Client - Backend Integration
// Handles all REST API calls to Flask backend
// ============================================

const API_CONFIG = {
    BASE_URL: window.location.origin + '/api',
    TIMEOUT: 8000,
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

};

/**
 * Fetch wrapper with timeout and error handling
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...options.headers
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data = null;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        // Check if response is ok
        if (!response.ok) {
            const errorMessage = data?.error || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return {
            success: true,
            status: response.status,
            data: data
        };

    } catch (error) {
        clearTimeout(timeoutId);

        // Handle specific error types
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection.');
        }

        throw error;
    }
}

/**
 * API Client - All methods for CRUD operations
 */
const APIClient = {
    // ==================== TEACHERS ====================

    /**
     * Get all teachers
     * @param {Object} filters - Optional filters {department, status}
     * @returns {Promise<Array>} List of teachers
     */
    async getTeachers(filters = {}) {
        try {
            let endpoint = '/teachers';
            
            // Build query string for filters
            if (Object.keys(filters).length > 0) {
                const params = new URLSearchParams(filters);
                endpoint += `?${params.toString()}`;
            }

            const response = await fetchAPI(endpoint);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching teachers:', error);
            throw error;
        }
    },

    /**
     * Get single teacher by ID
     * @param {string} teacherId - Teacher ID
     * @returns {Promise<Object>} Teacher object
     */
    async getTeacher(teacherId) {
        try {
            const response = await fetchAPI(`/teachers/${teacherId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching teacher:', error);
            throw error;
        }
    },

    /**
     * Create new teacher
     * @param {Object} teacherData - {name, email, department, status, phone}
     * @returns {Promise<Object>} Created teacher with ID
     */
    async createTeacher(teacherData) {
        try {
            const response = await fetchAPI('/teachers', {
                method: 'POST',
                body: JSON.stringify(teacherData)
            });
            return response.data;
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    },

    /**
     * Update existing teacher
     * @param {string} teacherId - Teacher ID
     * @param {Object} teacherData - Updated teacher data
     * @returns {Promise<Object>} Success response
     */
    async updateTeacher(teacherId, teacherData) {
        try {
            const response = await fetchAPI(`/teachers/${teacherId}`, {
                method: 'PUT',
                body: JSON.stringify(teacherData)
            });
            return response.data;
        } catch (error) {
            console.error('Error updating teacher:', error);
            throw error;
        }
    },

    /**
     * Delete teacher
     * @param {string} teacherId - Teacher ID
     * @returns {Promise<Object>} Success response
     */
    async deleteTeacher(teacherId) {
        try {
            const response = await fetchAPI(`/teachers/${teacherId}`, {
                method: 'DELETE'
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting teacher:', error);
            throw error;
        }
    },

    /**
     * Get teacher workload
     * @param {string} teacherId - Teacher ID
     * @returns {Promise<Object>} Workload details
     */
    async getTeacherWorkload(teacherId) {
        try {
            const response = await fetchAPI(`/teachers/${teacherId}/workload`);
            return response.data;
        } catch (error) {
            console.error('Error fetching teacher workload:', error);
            throw error;
        }
    },

    // ==================== SUBJECTS ====================

    /**
     * Get all subjects
     * @param {Object} filters - Optional filters {department, semester, teacher_id}
     * @returns {Promise<Array>} List of subjects
     */
    async getSubjects(filters = {}) {
        try {
            let endpoint = '/subjects';
            
            if (Object.keys(filters).length > 0) {
                const params = new URLSearchParams(filters);
                endpoint += `?${params.toString()}`;
            }

            const response = await fetchAPI(endpoint);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    /**
     * Get single subject by ID
     * @param {string} subjectId - Subject ID
     * @returns {Promise<Object>} Subject object
     */
    async getSubject(subjectId) {
        try {
            const response = await fetchAPI(`/subjects/${subjectId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subject:', error);
            throw error;
        }
    },

    /**
     * Create new subject
     * @param {Object} subjectData - Subject data
     * @returns {Promise<Object>} Created subject
     */
    async createSubject(subjectData) {
        try {
            const response = await fetchAPI('/subjects', {
                method: 'POST',
                body: JSON.stringify(subjectData)
            });
            return response.data;
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    },

    /**
     * Update subject
     * @param {string} subjectId - Subject ID
     * @param {Object} subjectData - Updated subject data
     * @returns {Promise<Object>} Success response
     */
    async updateSubject(subjectId, subjectData) {
        try {
            const response = await fetchAPI(`/subjects/${subjectId}`, {
                method: 'PUT',
                body: JSON.stringify(subjectData)
            });
            return response.data;
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    },

    /**
     * Delete subject
     * @param {string} subjectId - Subject ID
     * @returns {Promise<Object>} Success response
     */
    async deleteSubject(subjectId) {
        try {
            const response = await fetchAPI(`/subjects/${subjectId}`, {
                method: 'DELETE'
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    },

    // ==================== CLASSES ====================

    /**
     * Get all classes
     * @param {Object} filters - Optional filters {department, semester}
     * @returns {Promise<Array>} List of classes
     */
    async getClasses(filters = {}) {
        try {
            let endpoint = '/classes';
            
            if (Object.keys(filters).length > 0) {
                const params = new URLSearchParams(filters);
                endpoint += `?${params.toString()}`;
            }

            const response = await fetchAPI(endpoint);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    },

    /**
     * Get single class by ID
     * @param {string} classId - Class ID
     * @returns {Promise<Object>} Class object
     */
    async getClass(classId) {
        try {
            const response = await fetchAPI(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching class:', error);
            throw error;
        }
    },

    /**
     * Create new class
     * @param {Object} classData - Class data
     * @returns {Promise<Object>} Created class
     */
    async createClass(classData) {
        try {
            const response = await fetchAPI('/classes', {
                method: 'POST',
                body: JSON.stringify(classData)
            });
            return response.data;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    },

    /**
     * Update class
     * @param {string} classId - Class ID
     * @param {Object} classData - Updated class data
     * @returns {Promise<Object>} Success response
     */
    async updateClass(classId, classData) {
        try {
            const response = await fetchAPI(`/classes/${classId}`, {
                method: 'PUT',
                body: JSON.stringify(classData)
            });
            return response.data;
        } catch (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    },

    /**
     * Delete class
     * @param {string} classId - Class ID
     * @returns {Promise<Object>} Success response
     */
    async deleteClass(classId) {
        try {
            const response = await fetchAPI(`/classes/${classId}`, {
                method: 'DELETE'
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    },

    // ==================== TIMETABLE ====================

    /**
     * Get timetable slots
     * @param {Object} filters - Optional filters {class_id, day, period, teacher_id}
     * @returns {Promise<Array>} List of timetable slots
     */
    async getTimetable(filters = {}) {
        try {
            let endpoint = '/timetable';
            
            if (Object.keys(filters).length > 0) {
                const params = new URLSearchParams(filters);
                endpoint += `?${params.toString()}`;
            }

            const response = await fetchAPI(endpoint);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching timetable:', error);
            throw error;
        }
    },

    /**
     * Get single timetable slot
     * @param {string} slotId - Slot ID
     * @returns {Promise<Object>} Slot object
     */
    async getTimetableSlot(slotId) {
        try {
            const response = await fetchAPI(`/timetable/${slotId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching timetable slot:', error);
            throw error;
        }
    },

    /**
     * Create timetable slot
     * @param {Object} slotData - Slot data
     * @returns {Promise<Object>} Created slot
     */
    async createTimetableSlot(slotData) {
        try {
            const response = await fetchAPI('/timetable', {
                method: 'POST',
                body: JSON.stringify(slotData)
            });
            return response.data;
        } catch (error) {
            console.error('Error creating timetable slot:', error);
            throw error;
        }
    },

    /**
     * Update timetable slot
     * @param {string} slotId - Slot ID
     * @param {Object} slotData - Updated slot data
     * @returns {Promise<Object>} Success response
     */
    async updateTimetableSlot(slotId, slotData) {
        try {
            const response = await fetchAPI(`/timetable/${slotId}`, {
                method: 'PUT',
                body: JSON.stringify(slotData)
            });
            return response.data;
        } catch (error) {
            console.error('Error updating timetable slot:', error);
            throw error;
        }
    },

    /**
     * Delete timetable slot
     * @param {string} slotId - Slot ID
     * @returns {Promise<Object>} Success response
     */
    async deleteTimetableSlot(slotId) {
        try {
            const response = await fetchAPI(`/timetable/${slotId}`, {
                method: 'DELETE'
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting timetable slot:', error);
            throw error;
        }
    },

    /**
     * Check for conflicts
     * @param {Object} conflictData - {teacher, day, period}
     * @returns {Promise<Object>} Conflict check result
     */
    async checkConflicts(conflictData) {
        try {
            const response = await fetchAPI('/timetable/check-conflicts', {
                method: 'POST',
                body: JSON.stringify(conflictData)
            });
            return response.data;
        } catch (error) {
            console.error('Error checking conflicts:', error);
            throw error;
        }
    },

    // ==================== REPORTS ====================

    /**
     * Get statistics
     * @returns {Promise<Object>} System statistics
     */
    async getStatistics() {
        try {
            // Using a GET request that should be available or we can fetch from dashboard data
            const response = await fetchAPI('/health');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    },

    /**
     * Get workload report
     * @returns {Promise<Object>} Workload report
     */
    async getWorkloadReport() {
        try {
            const response = await fetchAPI('/reports/workload');
            return response.data;
        } catch (error) {
            console.error('Error fetching workload report:', error);
            throw error;
        }
    }
};

// Make APIClient available globally
window.APIClient = APIClient;
