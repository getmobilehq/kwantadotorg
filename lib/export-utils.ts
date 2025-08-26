'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  initials: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
}

interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  teamSize: number;
  teams: Team[];
  createdAt: string;
}

export const exportMatchToExcel = (match: Match) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Match Info sheet
  const matchInfo = [
    ['Match Details', ''],
    ['Title', match.title],
    ['Date', new Date(match.date).toLocaleDateString('en-GB')],
    ['Time', match.time],
    ['Location', match.location],
    ['Team Size', match.teamSize],
    ['Match ID', match.id],
    ['Created', new Date(match.createdAt).toLocaleString()]
  ];
  
  const matchInfoWS = XLSX.utils.aoa_to_sheet(matchInfo);
  XLSX.utils.book_append_sheet(wb, matchInfoWS, 'Match Info');
  
  // Teams & Players sheet
  const teamsData = [
    ['Team Name', 'Player Name', 'Email', 'Phone', 'Slot Number']
  ];
  
  match.teams.forEach((team, teamIndex) => {
    if (team.players.length === 0) {
      teamsData.push([team.name, 'No players registered', '', '', '']);
    } else {
      team.players.forEach((player, playerIndex) => {
        teamsData.push([
          team.name,
          player.name,
          player.email || '',
          player.phone || '',
          (playerIndex + 1).toString()
        ]);
      });
    }
  });
  
  const teamsWS = XLSX.utils.aoa_to_sheet(teamsData);
  XLSX.utils.book_append_sheet(wb, teamsWS, 'Teams & Players');
  
  // Summary sheet
  const totalPlayers = match.teams.reduce((total, team) => total + team.players.length, 0);
  const totalSlots = match.teamSize * 2;
  const fillPercentage = Math.round((totalPlayers / totalSlots) * 100);
  
  const summaryData = [
    ['Match Summary', ''],
    ['Total Teams', match.teams.length.toString()],
    ['Total Players Registered', totalPlayers.toString()],
    ['Total Available Slots', totalSlots.toString()],
    ['Fill Percentage', `${fillPercentage}%`],
    ['Empty Slots', (totalSlots - totalPlayers).toString()]
  ];
  
  match.teams.forEach((team, index) => {
    summaryData.push([
      `${team.name} Players`,
      `${team.players.length}/${match.teamSize}`
    ]);
  });
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  
  // Generate filename
  const filename = `match_${match.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(match.date).toISOString().split('T')[0]}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportMatchToPDF = (match: Match) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(match.title, 20, 20);
  
  // Match details
  doc.setFontSize(12);
  let yPos = 40;
  
  doc.text(`Date: ${new Date(match.date).toLocaleDateString('en-GB')}`, 20, yPos);
  yPos += 7;
  doc.text(`Time: ${match.time}`, 20, yPos);
  yPos += 7;
  doc.text(`Location: ${match.location}`, 20, yPos);
  yPos += 7;
  doc.text(`Team Size: ${match.teamSize}v${match.teamSize}`, 20, yPos);
  yPos += 15;
  
  // Summary statistics
  const totalPlayers = match.teams.reduce((total, team) => total + team.players.length, 0);
  const totalSlots = match.teamSize * 2;
  const fillPercentage = Math.round((totalPlayers / totalSlots) * 100);
  
  doc.setFontSize(14);
  doc.text('Match Summary', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Total Players: ${totalPlayers}/${totalSlots} (${fillPercentage}%)`, 20, yPos);
  yPos += 5;
  doc.text(`Empty Slots: ${totalSlots - totalPlayers}`, 20, yPos);
  yPos += 15;
  
  // Teams and players table
  const tableData: any[] = [];
  
  match.teams.forEach((team, teamIndex) => {
    // Team header
    tableData.push([
      { content: team.name, colSpan: 4, styles: { fillColor: teamIndex === 0 ? [34, 197, 94] : [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' } }
    ]);
    
    if (team.players.length === 0) {
      tableData.push(['', 'No players registered', '', '']);
    } else {
      team.players.forEach((player, playerIndex) => {
        tableData.push([
          `Slot ${playerIndex + 1}`,
          player.name,
          player.email || '-',
          player.phone || '-'
        ]);
      });
      
      // Empty slots
      for (let i = team.players.length; i < match.teamSize; i++) {
        tableData.push([
          `Slot ${i + 1}`,
          'Available',
          '-',
          '-'
        ]);
      }
    }
  });
  
  autoTable(doc, {
    head: [['Slot', 'Player Name', 'Email', 'Phone']],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [75, 85, 99],
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Match ID: ${match.id}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Generate filename
  const filename = `match_${match.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(match.date).toISOString().split('T')[0]}.pdf`;
  
  // Save file
  doc.save(filename);
};