from flask import request, jsonify, g
import csv
from io import StringIO
from datetime import datetime

from function.isCET import isCET
from function.db import get_db
from function.GetClassSchoolyear import GetClassSchoolyear

from flask_jwt_extended import jwt_required, get_jwt_identity

@jwt_required()
def main():
    Email = get_jwt_identity()['email']
    CSYID = request.args.get('CSYID')
    conn = g.db
    cur = conn.cursor()

    if not isCET(conn, cur, Email, CSYID):
        jsonify({
            'success': False,
            'msg': "You don't have permission.",
            'data': {}
        }), 200

    query_generate_columns = """
        SELECT
            GROUP_CONCAT(
                DISTINCT 
                CONCAT(
                    'ROUND(MAX(CASE 
                        WHEN SMT.LID = ', QST.LID, 
                        ' AND SMT.QID = ', QST.QID, 
                        ' THEN SMT.Score ELSE 0 END), 2) AS `Score_L', LB.Lab, '_Q', QST.QID, '`'
                )
            ) AS dynamic_column
        FROM 
            question QST
            JOIN lab LB ON QST.LID = LB.LID
        WHERE 
            QST.CSYID = %s;
    """
    cur.execute(query_generate_columns, (CSYID))

    dynamic_columns = cur.fetchone()[0]

    query_dynamic_sql = f"""
        SELECT 
            STD.UID AS `ID`,
            USR.Name AS `Name (English)`,
            SCT.Section AS `Section`,
            COALESCE(GRP.Group, \'-\') AS `Group`, {dynamic_columns}
        FROM 
            student STD
            LEFT JOIN user USR ON USR.UID = STD.UID
            LEFT JOIN submitted SMT ON SMT.UID = STD.UID AND SMT.CSYID = STD.CSYID
            LEFT JOIN lab LB ON SMT.LID = LB.LID
            INNER JOIN section SCT ON STD.CSYID = SCT.CSYID AND SCT.CID = STD.CID
            LEFT JOIN `group` GRP ON GRP.GID = STD.GID
            LEFT JOIN question QST ON QST.LID = LB.LID
        WHERE
            STD.CSYID = %s
        GROUP BY 
            STD.UID, USR.Name, SCT.Section, GRP.Group
        ORDER BY
            Section ASC, ID ASC;
    """

    cur.execute(query_dynamic_sql, (CSYID))

    ListResult = cur.fetchall()

    ClassID, SchoolYear = GetClassSchoolyear(conn, cur, CSYID) 
    

    qr = """
    SELECT CONCAT(
            'Score_L', 
            lab.Lab, 
            '(', 
            lab.LID, 
            ')',
            '_Q', 
            ROW_NUMBER() OVER (PARTITION BY lab.LID ORDER BY question.QID), 
            '(', 
            question.MaxScore, 
            ')'
        ) AS Name
    FROM question
    JOIN lab ON question.LID = lab.LID
    WHERE lab.CSYID = %s
    ORDER BY lab.LID, question.QID;
    """
    cur.execute(qr, (CSYID))
    dyna_colum = cur.fetchall()

    fieldnames = ['ID', 'Name (English)', 'Section', 'Group'] + [i[0] for i in dyna_colum]
    CSV_data = []
    # CSV_data = [{fieldnames[j]:i[j] for j in range(len(i))} for i in ListResult]
    for i in ListResult:
        tempdata = {}
        for j in range(len(i)):
            tempdata[fieldnames[j]] = i[j]
        CSV_data.append(tempdata)

    temp_output = StringIO()
    
    writer = csv.DictWriter(temp_output, fieldnames=fieldnames)
    writer.writeheader()
    for row in CSV_data:
        writer.writerow(row)

    temp_output.seek(0)
    temp_csv_data = temp_output.getvalue()
    temp_output.close()

    output = StringIO(temp_csv_data)
    
    return jsonify({
        'success': True,
        'msg': '',
        'data': {
            'csv': output.getvalue(),
            'filename': f"{ClassID}_{SchoolYear}_{datetime.now().strftime('%d-%m-%YT%H-%M-%S')}_Separate_questions.csv"
        }
    })