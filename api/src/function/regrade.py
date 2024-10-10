import json

import function.grader as grader

def regrade(conn, cursor, isSourceUpdate: bool, QID, LID):
    if QID == None:
        cursor.execute("SELECT QID FROM `question` WHERE LID = %s", (LID))
        for i in cursor.fetchall():
            regrade(conn, cursor, isSourceUpdate, i[0], LID)
        return


    select_query = "SELECT Path FROM addfile WHERE LID = %s"
    cursor.execute(select_query, (LID,))
    result = cursor.fetchall()

    addfiles = [row[0] for row in result]

    # ADF update but source
    if not isSourceUpdate:
        query = "SELECT SourcePath FROM `question` WHERE `QID`=%s"
        cursor.execute(query, (QID,))
        result = cursor.fetchone()
        source_path = result[0]

    Qinfo = grader.QinfoGenerate(source_path, addfile=addfiles)
    Qinfo_query = "UPDATE `question` SET `Qinfo`=%s WHERE `QID`=%s"
    cursor.execute(Qinfo_query, (json.dumps(Qinfo), QID))
    conn.commit()

    select_query = """
        SELECT 
            `SID`, 
            `SummitedFile` 
        FROM 
            `submitted` 
        WHERE
            QID = %s
    """
    cursor.execute(select_query, (QID))
    result = cursor.fetchall()

    for SID, filepath in result:
        err, data = grader.grade(source_path, filepath, addfile=addfiles, validate=False, check_keyword="ok", Qinfo=Qinfo)
        if err:
            # return jsonify({
            #     'success': False,
            #     'msg': f'There is a problem while grading.\n{data}',
            #     'data': {}
            # }), 200
            data = [[0,1]]

        s, m = 0, 0

        if len(data) == 1:
            s += float(data[0][0])  # Ensure data is converted to float
            m += float(data[0][1])  # Ensure data is converted to float
        else:
            for j in range(len(data)):
                s += float(data[j][0])  # Ensure data is converted to float
                m += float(data[j][1])  # Ensure data is converted to float

        cursor.execute('''
            SELECT MaxScore
            FROM question
            WHERE QID = %s AND LID = %s
        ''', (QID, LID))
        MSC = cursor.fetchone()
        if not MSC:
            return
        max_score = MSC[0] 


        # Check if m is zero to avoid division by zero
        if m == 0:
            Score = 0
        else:
            Score = float("{:.2f}".format((s / m) * float(max_score)))  # Ensure MaxScore is converted to float

        # Define the insert or update query
        upsert_query = """
            UPDATE 
                `submitted` 
            SET 
                `Score` = %s 
            WHERE 
                `SID` = %s
        """

        # Execute the query with the provided values
        cursor.execute(upsert_query, (Score, SID))
        conn.commit()