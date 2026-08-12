const Inspection = require('../models/Inspection')
const Issue = require('../models/Issue')
const Report = require('../models/Report')
const School = require('../models/School')
const InspectionPlan = require('../models/InspectionPlan')

class AnalyticsService {
  static async getInspectionMetrics(planId = null, schoolId = null) {
    const query = {}
    if (planId) query.planId = planId
    if (schoolId) query.schoolId = schoolId

    const total = await Inspection.countDocuments(query)
    const completed = await Inspection.countDocuments({
      ...query,
      status: 'COMPLETED',
    })
    const pending = await Inspection.countDocuments({
      ...query,
      status: 'PENDING',
    })
    const inProgress = await Inspection.countDocuments({
      ...query,
      status: 'IN_PROGRESS',
    })

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      inProgress,
      completionRate,
    }
  }

  static async getIssueMetrics(planId = null, schoolId = null) {
    const query = {}
    if (planId) query.planId = planId
    if (schoolId) query.schoolId = schoolId

    const total = await Issue.countDocuments(query)
    const byPriority = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ])

    const byStatus = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    return {
      total,
      byPriority: Object.fromEntries(byPriority.map((p) => [p._id, p.count])),
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    }
  }

  static async getComplianceMetrics(schoolId = null) {
    const query = schoolId ? { schoolId } : {}

    const issues = await Issue.find(query).select('priority status')
    const inspections = await Inspection.find(query)

    const totalIssues = issues.length
    const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED').length
    const complianceScore =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100

    const criticalUnresolved = issues.filter(
      (i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED'
    ).length

    return {
      totalIssues,
      resolvedIssues,
      unresolvedIssues: totalIssues - resolvedIssues,
      complianceScore,
      criticalUnresolved,
      inspectionCount: inspections.length,
    }
  }

  static async getSchoolPerformance() {
    return School.aggregate([
      {
        $lookup: {
          from: 'inspections',
          localField: '_id',
          foreignField: 'schoolId',
          as: 'inspections',
        },
      },
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'schoolId',
          as: 'issues',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          district: 1,
          totalInspections: { $size: '$inspections' },
          completedInspections: {
            $size: {
              $filter: {
                input: '$inspections',
                as: 'insp',
                cond: { $eq: ['$$insp.status', 'COMPLETED'] },
              },
            },
          },
          totalIssues: { $size: '$issues' },
          resolvedIssues: {
            $size: {
              $filter: {
                input: '$issues',
                as: 'issue',
                cond: { $eq: ['$$issue.status', 'RESOLVED'] },
              },
            },
          },
          criticalIssues: {
            $size: {
              $filter: {
                input: '$issues',
                as: 'issue',
                cond: { $eq: ['$$issue.priority', 'CRITICAL'] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          complianceScore: {
            $cond: [
              { $eq: ['$totalIssues', 0] },
              100,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$resolvedIssues', '$totalIssues'] },
                      100,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      { $sort: { complianceScore: -1 } },
    ])
  }

  static async getTrendAnalytics(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const inspectionTrend = await Inspection.aggregate([
      {
        $match: {
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const issueTrend = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return {
      inspectionTrend,
      issueTrend,
    }
  }

  static async exportAnalyticsReport(format = 'json', filters = {}) {
    const metrics = {
      inspections: await this.getInspectionMetrics(
        filters.planId,
        filters.schoolId
      ),
      issues: await this.getIssueMetrics(filters.planId, filters.schoolId),
      compliance: await this.getComplianceMetrics(filters.schoolId),
      schoolPerformance: await this.getSchoolPerformance(),
      trends: await this.getTrendAnalytics(filters.days || 30),
    }

    if (format === 'csv') {
      return this.convertToCSV(metrics)
    }

    return metrics
  }

  static convertToCSV(data) {
    let csv = 'Analytics Report\n\n'

    csv += 'Inspection Metrics\n'
    csv += 'Total,Completed,Pending,In Progress,Completion Rate\n'
    const insp = data.inspections
    csv += `${insp.total},${insp.completed},${insp.pending},${insp.inProgress},${insp.completionRate}%\n\n`

    csv += 'Issue Metrics\n'
    csv += 'Total Issues\n'
    csv += `${data.issues.total}\n\n`

    csv += 'School Performance\n'
    csv += 'School Name,District,Total Inspections,Completed,Total Issues,Resolved,Critical Issues,Compliance Score\n'
    data.schoolPerformance.forEach((school) => {
      csv += `${school.name},${school.district},${school.totalInspections},${school.completedInspections},${school.totalIssues},${school.resolvedIssues},${school.criticalIssues},${school.complianceScore}%\n`
    })

    return csv
  }
}

module.exports = AnalyticsService
