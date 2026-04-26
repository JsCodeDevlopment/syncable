"use client";

import { formatCurrency } from "@/lib/format-currency";
import { formatDuration } from "@/lib/format-duration";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Register fonts for better aesthetics if needed
// For now we'll use standard ones as remote fonts can be tricky in some environments

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 9,
    color: "#334155",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  brandSection: {
    flexDirection: "column",
    gap: 8,
  },
  logo: {
    width: 150,
    height: 55,
    objectFit: "contain",
  },
  reportBadge: {
    fontSize: 7,
    color: "#3B82F6",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#64748B",
    marginTop: 5,
  },
  personalInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    width: 250,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  userDoc: {
    fontSize: 9,
    color: "#64748B",
    letterSpacing: 0.5,
  },
  reportMeta: {
    textAlign: "right",
    gap: 12,
  },
  metaItem: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 7,
    color: "#94A3B8",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    color: "#0F172A",
    fontWeight: "bold",
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 45,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  summaryCardAccent: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  summaryCardPrimary: {
    backgroundColor: "#3B82F6",
    borderColor: "#2563EB",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  summaryLabelPrimary: {
    color: "#DBEAFE",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  summaryValuePrimary: {
    color: "#FFFFFF",
  },
  summarySubValue: {
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 4,
  },
  summarySubValuePrimary: {
    color: "#BFDBFE",
  },

  // Table
  tableContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0F172A",
    paddingLeft: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: "#0F172A",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowAlternate: {
    backgroundColor: "#FDFDFD",
  },

  // Columns
  colDate: { width: "15%" },
  colProject: { width: "25%" },
  colPeriod: { width: "25%" },
  colWork: { width: "15%", textAlign: "right" },
  colBreaks: { width: "10%", textAlign: "right", color: "#F97316" },
  colNet: {
    width: "10%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0F172A",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#94A3B8",
    fontSize: 7,
  },

  projectTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  userDoc: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
});

interface ReportPDFProps {
  data: any;
  reportInfo: {
    name: string;
    type: string;
    startDate: Date;
    endDate: Date;
    idNumber?: string;
    userName?: string;
    userDocument?: string;
    showEarnings?: boolean;
  };
}

export function ReportPDF({ data, reportInfo }: ReportPDFProps) {
  const { entries, summary } = data;

  return (
    <Document title={`Syncable Report - ${reportInfo.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Image src="/images/syncable-logo.png" style={styles.logo} />
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Text style={styles.reportBadge}>Official Statement</Text>
              <Text style={{ fontSize: 7, color: "#94A3B8" }}>•</Text>
              <Text
                style={{ fontSize: 7, color: "#64748B", fontWeight: "bold" }}
              >
                {reportInfo.type}
              </Text>
            </View>

            {(reportInfo.userName || reportInfo.userDocument) && (
              <View style={styles.personalInfo}>
                {reportInfo.userName && (
                  <Text style={styles.userName}>{reportInfo.userName}</Text>
                )}
                {reportInfo.userDocument && (
                  <Text style={styles.userDoc}>
                    Document: {reportInfo.userDocument}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.reportMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Reporting Period</Text>
              <Text style={styles.metaValue}>
                {reportInfo.startDate.toLocaleDateString()} -{" "}
                {reportInfo.endDate.toLocaleDateString()}
              </Text>
            </View>
            {reportInfo.idNumber && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Reference Code</Text>
                <Text style={styles.metaValue}>{reportInfo.idNumber}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Generation Date</Text>
              <Text style={styles.metaValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Duration</Text>
            <Text style={styles.summaryValue}>
              {formatDuration(summary.totalNetWork)}
            </Text>
            <Text style={styles.summarySubValue}>Net billable hours</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardAccent]}>
            <Text style={styles.summaryLabel}>Recorded Breaks</Text>
            <Text style={styles.summaryValue}>
              {formatDuration(summary.totalBreaks)}
            </Text>
            <Text style={styles.summarySubValue}>Rest and intervals</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active Engagement</Text>
            <Text style={styles.summaryValue}>{summary.daysWorked} Days</Text>
            <Text style={styles.summarySubValue}>Recorded sessions</Text>
          </View>
          {reportInfo.showEarnings !== false && summary.hourlyRate && (
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelPrimary]}>
                Estimated Value
              </Text>
              <Text style={[styles.summaryValue, styles.summaryValuePrimary]}>
                {formatCurrency(summary.totalPayable, summary.currency)}
              </Text>
              <Text
                style={[styles.summarySubValue, styles.summarySubValuePrimary]}
              >
                At {formatCurrency(summary.hourlyRate, summary.currency)}/h
              </Text>
            </View>
          )}
        </View>

        {/* Detailed Activity Log */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Detailed Activity Log</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.colDate, styles.tableHeaderText]}>Date</Text>
            <Text style={[styles.colProject, styles.tableHeaderText]}>
              Project
            </Text>
            <Text style={[styles.colPeriod, styles.tableHeaderText]}>
              Time Span
            </Text>
            <Text style={[styles.colWork, styles.tableHeaderText]}>Work</Text>
            <Text style={[styles.colBreaks, styles.tableHeaderText]}>
              Breaks
            </Text>
            <Text style={[styles.colNet, styles.tableHeaderText]}>Net</Text>
          </View>

          {entries.map((entry: any, index: number) => (
            <View
              key={entry.id}
              style={[
                styles.tableRow,
                index % 2 !== 0 && styles.tableRowAlternate,
              ]}
            >
              <View style={styles.colDate}>
                <Text style={{ fontWeight: "bold" }}>{entry.date}</Text>
              </View>
              <View style={styles.colProject}>
                <View style={styles.projectTag}>
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: entry.project_color || "#94A3B8" },
                    ]}
                  />
                  <Text style={styles.projectText}>
                    {entry.project_name || "General"}
                  </Text>
                </View>
              </View>
              <View style={styles.colPeriod}>
                <Text style={{ color: "#64748B" }}>
                  {entry.startTime} - {entry.endTime || "Ongoing"}
                </Text>
              </View>
              <View style={styles.colWork}>
                <Text>{formatDuration(entry.duration)}</Text>
              </View>
              <View style={styles.colBreaks}>
                <Text>{formatDuration(entry.breaks)}</Text>
              </View>
              <View style={styles.colNet}>
                <Text>{formatDuration(entry.netWork)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Official Activity Statement • Powered by Syncable</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
